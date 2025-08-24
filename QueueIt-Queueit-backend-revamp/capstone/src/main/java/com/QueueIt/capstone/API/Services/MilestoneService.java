package com.QueueIt.capstone.API.Services;
import com.QueueIt.capstone.API.DTO.*;
import com.QueueIt.capstone.API.Entities.Milestone;
import com.QueueIt.capstone.API.Entities.MilestoneSet;
import com.QueueIt.capstone.API.Entities.Module;
import com.QueueIt.capstone.API.Entities.Task;
import com.QueueIt.capstone.API.Enums.NotificationType;
import com.QueueIt.capstone.API.Middlewares.MilestoneSetAlreadyExistException;
import com.QueueIt.capstone.API.Repository.MilestoneRepository;
import com.QueueIt.capstone.API.Repository.MilestoneSetRespository;
import com.QueueIt.capstone.API.Repository.ModuleRepository;
import com.QueueIt.capstone.API.Repository.TaskRepository;
import com.QueueIt.capstone.API.Utilities.DateUtility;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class MilestoneService {

    @Autowired
    private MilestoneSetRespository milestoneSetRespository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public MilestoneSet createMilestoneSet(MilestoneSetDTO milestoneSetDTO) throws MilestoneSetAlreadyExistException {
        if (milestoneSetRespository.findByTeamID(milestoneSetDTO.getTeamID()).isPresent()){
            throw new MilestoneSetAlreadyExistException("Already exist");
        }
        MilestoneSet milestoneSet = new MilestoneSet(
                milestoneSetDTO.getTeamName(),
                milestoneSetDTO.getTeamID(),
                milestoneSetDTO.getApproverID()
        );

        milestoneSet = milestoneSetRespository.save(milestoneSet);

        for (int i = 0; i < milestoneSetDTO.getMilestones().size(); i++){
            MilestoneDTO milestoneDTO = milestoneSetDTO.getMilestones().get(i);

            Milestone milestone = new Milestone(
                    milestoneDTO.getTitle(),
                    i,
                    milestoneSet
            );

            milestone = milestoneRepository.save(milestone);

            for (ModuleDTO moduleDTO: milestoneDTO.getModules()){
                Module module = new Module(
                        moduleDTO.getModuleName(),
                        milestone
                );
                module = moduleRepository.save(module);

                for (TaskDTO taskDTO: moduleDTO.getTasks()){
                    Task task = new Task(
                            taskDTO.getDescription(),
                            taskDTO.getTaskName(),
                            module
                    );

                    task = taskRepository.save(task);
                    module.getTasks().add(task);
                }

                module = moduleRepository.save(module);

                milestone.getModules().add(module);
            }
            milestone = milestoneRepository.save(milestone);

            milestoneSet.getMilestones().add(milestone);
        }

        return milestoneSetRespository.save(milestoneSet);
    }

    public MilestoneSet getMilestoneSet(Long teamID){
        return milestoneSetRespository.findByTeamID(teamID).orElseThrow();
    }

    @Transactional
    public void updateMilestoneSet(MilestoneSetDTO milestoneSetDTO) throws MilestoneSetAlreadyExistException {
        MilestoneSet milestoneSet = milestoneSetRespository.findByTeamID(milestoneSetDTO.getTeamID()).orElseThrow(()->new RuntimeException("Milestone set not found"));
        List<Milestone> milestones = milestoneSet.getMilestones();
        for (Milestone milestone: milestones){
            List<Module> modules = milestone.getModules();
            for (Module module: modules){
                List<Task> tasks = module.getTasks();
                module.getTasks().clear();
            }
            milestone.getModules().clear();
        }
        milestoneSet.getMilestones().clear();
        milestoneSetRespository.delete(milestoneSet);

        createMilestoneSet(milestoneSetDTO);

    }

    public MilestoneSet approveMilestoneSet(Long milestoneSetID, Long facultyID){

        MilestoneSet milestoneSet = milestoneSetRespository.findById(milestoneSetID)
                .orElseThrow(()-> new RuntimeException("Milestone set not found"));

        if (!Objects.equals(milestoneSet.getApproverID(), facultyID)){
            throw new RuntimeException("Insufficient rights for approval");
        }

        if (milestoneSet.isApproved()){
            throw new RuntimeException("Milestone set is already approved");
        }
        milestoneSet.setApproved(true);
        milestoneSet.setApprovedDate(LocalDateTime.now());
        List<Integer> teamIDList = new ArrayList<>();
        teamIDList.add(milestoneSet.getTeamID().intValue());
        notificationService.generateNotificationRecipientsForSelectedTeams(
                facultyID,
                new TeamsIDRequest(teamIDList),
                null,
                "Your team "+milestoneSet.getTeamName()+"'s milestone has been approved on "+ DateUtility.formatLocalDateTimeToReadable(LocalDateTime.now()),
                NotificationType.REMINDER
        );

        return milestoneSetRespository.save(milestoneSet);
    }

    public MilestoneSet unlockMilestoneSet(Long milestoneSetID, Long facultyID){
        MilestoneSet milestoneSet = milestoneSetRespository.findById(milestoneSetID)
                .orElseThrow(()-> new RuntimeException("Milestone set not found"));

        if (!Objects.equals(milestoneSet.getApproverID(), facultyID)){
            throw new RuntimeException("Insufficient rights for unlocking");
        }

        if (!milestoneSet.isApproved()){
            throw new RuntimeException("Milestone is already unlocked");
        }
        milestoneSet.setApproved(false);
        List<Integer> teamIDList = new ArrayList<>();
        teamIDList.add(milestoneSet.getTeamID().intValue());
        notificationService.generateNotificationRecipientsForSelectedTeams(
                facultyID,
                new TeamsIDRequest(teamIDList),
                null,
                "Your team "+milestoneSet.getTeamName()+"'s milestone has been unlocked and is ready for modification on "+ DateUtility.formatLocalDateTimeToReadable(LocalDateTime.now()),
                NotificationType.REMINDER
        );

        return milestoneSetRespository.save(milestoneSet);
    }


    public MilestoneSet markTaskAsComplete(Long taskID, Long facultyID) {
        Task task = taskRepository.findById(taskID)
                .orElseThrow(()-> new RuntimeException("Task not found"));

        task.setCompleted(true);
        task.setCompletionDate(LocalDateTime.now());

        Module module = task.getModule();
        int moduleSize = module.getTasks().size();
        int moduleProgress = (int) module.getTasks().stream().filter(Task::isCompleted).count();

        // Check to avoid division by zero
        int totalModuleProgress = moduleSize > 0 ? (int) ((double) moduleProgress / moduleSize * 100) : 0;

//        System.out.println("\n\nmoduleSize: "+moduleSize+"\n\n moduleprogress: "+moduleProgress+"\n\n total module progress: "+totalModuleProgress);

        if (totalModuleProgress >= 100){
            module.setCompletionDate(LocalDateTime.now());
            module.setCompleted(true);
            module.setCompletionPercentage(100);
        }else{
            module.setCompletionPercentage(totalModuleProgress);
        }

        Milestone milestone = module.getMilestone();
        int totalNumberCompletedTasks = (int) milestone.getModules().stream()
                .flatMap(modularInstance -> modularInstance.getTasks().stream()) // Flatten the tasks from each module
                .filter(Task::isCompleted) // Filter for completed tasks
                .count(); // Count the completed tasks
        int totalNumberTasks = milestone.getModules().stream()
                .mapToInt(moduleInstance -> moduleInstance.getTasks().size())
                .sum();
        int totalMilestoneProgress = totalNumberTasks > 0 ? (int) ((double) totalNumberCompletedTasks / totalNumberTasks * 100):0;
//        System.out.println("\n\ntotalNum Task: "+totalNumberTasks+"\n\n total task complete: "+totalNumberCompletedTasks+"\n\n milestone progress: "+totalMilestoneProgress);
        if (totalMilestoneProgress >= 100){
            milestone.setCompleted(true);
            milestone.setCompletionDate(LocalDateTime.now());
            milestone.setCompletionPercentage(100);
        }else{
            milestone.setCompletionPercentage(totalMilestoneProgress);
        }

        MilestoneSet milestoneSet = milestone.getMilestoneSet();
        int grossCompletedTasks = (int) milestoneSet.getMilestones().stream().flatMap(milestoneInstance -> milestoneInstance.getModules()
                .stream().flatMap(module2Instance -> module2Instance.getTasks()
                        .stream().filter(Task::isCompleted))).count();
        int grossTasks = milestoneSet.getMilestones().stream()
                .flatMap(milestone3instance -> milestone3instance.getModules().stream())
                .mapToInt(module5instance -> module5instance.getTasks().size()) // Get the size of tasks for each module
                .sum(); // Sum all the sizes
        int totalSetProgress = grossTasks > 0? (int) ((double) grossCompletedTasks / grossTasks * 100):0;
//        System.out.println("\n\nsetSize: "+grossTasks+"\n\n setprogresssum: "+grossCompletedTasks+"\n\n set progress: "+totalSetProgress);
        if (totalSetProgress >= 100){
            milestoneSet.setCompletionPercentage(100);
        }else{
            milestoneSet.setCompletionPercentage(totalSetProgress);
        }

        taskRepository.save(task);
        moduleRepository.save(module);
        milestoneRepository.save(milestone);
        return milestoneSetRespository.save(milestoneSet);
    }

    public MilestoneSet markTaskAsIncomplete(Long taskID, Long facultyID) {
        Task task = taskRepository.findById(taskID)
                .orElseThrow(()-> new RuntimeException("Task not found"));

        task.setCompleted(false);
        task.setCompletionDate(LocalDateTime.now());

        Module module = task.getModule();
        int moduleSize = module.getTasks().size();
        int moduleProgress = (int) module.getTasks().stream().filter(Task::isCompleted).count();

        // Check to avoid division by zero
        int totalModuleProgress = moduleSize > 0 ? (int) ((double) moduleProgress / moduleSize * 100) : 0;

//        System.out.println("\n\nmoduleSize: "+moduleSize+"\n\n moduleprogress: "+moduleProgress+"\n\n total module progress: "+totalModuleProgress);

        if (totalModuleProgress >= 100){
            module.setCompletionDate(LocalDateTime.now());
            module.setCompleted(true);
            module.setCompletionPercentage(100);
        }else{
            module.setCompletionPercentage(totalModuleProgress);
        }

        Milestone milestone = module.getMilestone();
        int totalNumberCompletedTasks = (int) milestone.getModules().stream()
                .flatMap(modularInstance -> modularInstance.getTasks().stream()) // Flatten the tasks from each module
                .filter(Task::isCompleted) // Filter for completed tasks
                .count(); // Count the completed tasks
        int totalNumberTasks = milestone.getModules().stream()
                .mapToInt(moduleInstance -> moduleInstance.getTasks().size())
                .sum();
        int totalMilestoneProgress = totalNumberTasks > 0 ? (int) ((double) totalNumberCompletedTasks / totalNumberTasks * 100):0;
//        System.out.println("\n\ntotalNum Task: "+totalNumberTasks+"\n\n total task complete: "+totalNumberCompletedTasks+"\n\n milestone progress: "+totalMilestoneProgress);
        if (totalMilestoneProgress >= 100){
            milestone.setCompleted(true);
            milestone.setCompletionDate(LocalDateTime.now());
            milestone.setCompletionPercentage(100);
        }else{
            milestone.setCompletionPercentage(totalMilestoneProgress);
        }

        MilestoneSet milestoneSet = milestone.getMilestoneSet();
        int grossCompletedTasks = (int) milestoneSet.getMilestones().stream().flatMap(milestoneInstance -> milestoneInstance.getModules()
                .stream().flatMap(module2Instance -> module2Instance.getTasks()
                        .stream().filter(Task::isCompleted))).count();
        int grossTasks = milestoneSet.getMilestones().stream()
                .flatMap(milestone3instance -> milestone3instance.getModules().stream())
                .mapToInt(module5instance -> module5instance.getTasks().size()) // Get the size of tasks for each module
                .sum(); // Sum all the sizes
        int totalSetProgress = grossTasks > 0? (int) ((double) grossCompletedTasks / grossTasks * 100):0;
//        System.out.println("\n\nsetSize: "+grossTasks+"\n\n setprogresssum: "+grossCompletedTasks+"\n\n set progress: "+totalSetProgress);
        if (totalSetProgress >= 100){
            milestoneSet.setCompletionPercentage(100);
        }else{
            milestoneSet.setCompletionPercentage(totalSetProgress);
        }

        taskRepository.save(task);
        moduleRepository.save(module);
        milestoneRepository.save(milestone);
        return milestoneSetRespository.save(milestoneSet);
    }

    public Integer getMilestoneProgressPercentage(Long teamID) {
        MilestoneSet milestoneSet = milestoneSetRespository.findByTeamID(teamID)
                .orElseThrow(()->new RuntimeException("Not found"));

        return Integer.valueOf(milestoneSet.getCompletionPercentage());
    }
}
