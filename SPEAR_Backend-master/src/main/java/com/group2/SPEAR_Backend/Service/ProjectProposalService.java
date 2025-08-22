package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.FeatureDTO;
import com.group2.SPEAR_Backend.DTO.ProjectProposalDTO;
import com.group2.SPEAR_Backend.Model.*;
import com.group2.SPEAR_Backend.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectProposalService {

    @Autowired
    private ProjectProposalRepository ppRepo;

    @Autowired
    private ClassesRepository cRepo;

    @Autowired
    private UserRepository uRepo;

    @Autowired
    private FeatureRepository fRepo;

    @Autowired
    private TeamRepository tRepo;


    @Transactional
    public ProjectProposal createProjectProposal(ProjectProposalDTO dto, List<FeatureDTO> features) {
        User user = uRepo.findById(dto.getProposedById())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getProposedById()));

        Classes clazz = cRepo.findById(dto.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found with ID: " + dto.getClassId()));

        Team team = dto.getTeamId() != null
                ? tRepo.findById(dto.getTeamId()).orElseThrow(() -> new RuntimeException("Team not found with ID: " + dto.getTeamId()))
                : null;

        ProjectProposal proposal = new ProjectProposal(dto.getProjectName(), dto.getDescription(), user, clazz, team);
        ProjectProposal savedProposal = ppRepo.save(proposal);


        if (features != null && !features.isEmpty()) {
            List<Feature> featureEntities = features.stream()
                    .map(feature -> new Feature(feature.getFeatureTitle(), feature.getFeatureDescription(), savedProposal))
                    .toList();
            fRepo.saveAll(featureEntities);
        }
        return savedProposal;
    }

    private ProjectProposalDTO mapProposalToDTO(ProjectProposal proposal) {
        List<FeatureDTO> features = fRepo.findByProjectId(proposal.getPid()).stream()
                .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                .toList();

        return new ProjectProposalDTO(
                proposal.getPid(),
                proposal.getProjectName(),
                proposal.getDescription(),
                proposal.getStatus().name(),
                proposal.getReason(),
                proposal.getProposedBy().getUid(),
                proposal.getClassProposal().getCid(),
                proposal.getTeamProject() != null ? proposal.getTeamProject().getTid() : null,
                features,
                proposal.getProposedBy().getFirstname() + " " + proposal.getProposedBy().getLastname(),
                proposal.getTeamProject() != null ? proposal.getTeamProject().getGroupName() : null
        );
    }

    @Transactional
    public void updateProposalAndFeatures(int proposalId, int userId, String projectName, String description, List<FeatureDTO> features) {
        ProjectProposal proposal = ppRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Project proposal with ID " + proposalId + " not found"));

        if (proposal.getProposedBy().getUid() != userId) {
            throw new IllegalArgumentException("You are not authorized to edit this proposal.");
        }
        if (proposal.getStatus() == ProjectStatus.DENIED) {
            proposal.setStatus(ProjectStatus.PENDING);
            proposal.setReason(null);
        }
        if (projectName != null && !projectName.isBlank()) {
            proposal.setProjectName(projectName);
        }
        if (description != null && !description.isBlank()) {
            proposal.setDescription(description);
        }

        if (features != null) {
            List<Feature> existingFeatures = fRepo.findByProjectId(proposalId);
            fRepo.deleteAll(existingFeatures);

            List<Feature> newFeatures = features.stream()
                    .map(f -> new Feature(f.getFeatureTitle(), f.getFeatureDescription(), proposal))
                    .toList();

            fRepo.saveAll(newFeatures);
        }

        ppRepo.save(proposal);
    }


    private ProjectProposalDTO mapProposalToDTOWithFeatures(ProjectProposal proposal) {
        List<FeatureDTO> features = fRepo.findByProjectId(proposal.getPid()).stream()
                .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                .toList();

        String courseCode = proposal.getClassProposal().getCourseCode();

        return new ProjectProposalDTO(
                proposal.getPid(),
                proposal.getProjectName(),
                proposal.getDescription(),
                proposal.getStatus().name(),
                proposal.getReason(),
                proposal.getProposedBy().getUid(),
                proposal.getClassProposal().getCid(),
                proposal.getTeamProject() != null ? proposal.getTeamProject().getTid() : null,
                features,
                proposal.getProposedBy().getFirstname() + " " + proposal.getProposedBy().getLastname(),
                proposal.getTeamProject() != null ? proposal.getTeamProject().getGroupName() : null
        );
    }

    //get all active proposals
    public List<ProjectProposalDTO> getAllActiveProposals() {
        return ppRepo.findAllActive().stream()
                .map(this::mapProposalToDTOWithFeatures)
                .toList();
    }

    //some other project proposals get functions
    public List<ProjectProposalDTO> getProposalsByClassAndStudent(Long classId, int studentId) {
        return ppRepo.findByClassAndStudent(classId, studentId).stream()
                .filter(proposal -> proposal.getTeamProject() == null || proposal.getTeamProject().getMembers().stream()
                        .anyMatch(member -> member.getUid() == studentId))  // Ensure proposal belongs to student's team
                .map(this::mapProposalToDTO)
                .toList();
    }

    public List<ProjectProposalDTO> getProposalsByAdviser(int adviserId) {
        return ppRepo.findByAdviser(adviserId).stream().map(this::mapProposalToDTO).toList();
    }

    public List<ProjectProposalDTO> getProposalsByStatus(ProjectStatus status) {
        return ppRepo.findByStatus(status).stream().map(this::mapProposalToDTO).toList();
    }

    public List<ProjectProposalDTO> getProposalsByTeamId(int teamId) {
        return ppRepo.findByTeamId(teamId).stream().map(this::mapProposalToDTO).toList();
    }
    public List<ProjectProposalDTO> getOpenProjectsByClassId(Long classId) {
        return ppRepo.findOpenProjectsByClassId(classId).stream()
                .map(this::mapProposalToDTOWithFeatures)
                .toList();
    }
    public List<ProjectProposalDTO> getProposalsByAdviserAssignedTeams(int adviserId) {
        return ppRepo.findProposalsByAdviserAssignedTeams(adviserId).stream()
                .map(this::mapProposalToDTOWithFeatures)
                .toList();
    }
    public List<ProjectProposalDTO> getProposalsByClassId(Long classId) {
        return ppRepo.findByClassId(classId).stream()
                .map(this::mapProposalToDTOWithFeatures)
                .toList();
    }

    public ProjectProposalDTO getProposalById(int proposalId) {
        ProjectProposal proposal = ppRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Project proposal with ID " + proposalId + " not found"));

        List<FeatureDTO> features = fRepo.findByProjectId(proposalId).stream()
                .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                .toList();

        return new ProjectProposalDTO(
                proposal.getPid(),
                proposal.getProjectName(),
                proposal.getDescription(),
                proposal.getStatus().name(),
                proposal.getReason(),
                proposal.getProposedBy().getUid(),
                proposal.getClassProposal().getCid(),
                proposal.getTeamProject() != null ? proposal.getTeamProject().getTid() : null,
                features,
                proposal.getProposedBy().getFirstname() + " " + proposal.getProposedBy().getLastname(),
                proposal.getTeamProject() != null ? proposal.getTeamProject().getGroupName() : null
        );
    }
    public List<ProjectProposal> getAllOfficialProjects() {
        return tRepo.findAll().stream()
                .map(Team::getProject)
                .filter(project -> project != null)
                .collect(Collectors.toList());
    }
    public List<ProjectProposalDTO> getAllDeletedProposals() {
        return ppRepo.findAllDeleted().stream()
                .map(this::mapProposalToDTOWithFeatures)
                .toList();
    }





    //update the proposal
    public ProjectProposal updateProposalStatus(int id, String status, String reason) {
        ProjectProposal proposal = ppRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project proposal with ID " + id + " not found"));

        if (ProjectStatus.APPROVED.name().equalsIgnoreCase(status)) {
            proposal.setStatus(ProjectStatus.APPROVED);
            proposal.setReason(null);
        } else if (ProjectStatus.DENIED.name().equalsIgnoreCase(status)) {
            if (reason == null || reason.isBlank()) {
                throw new RuntimeException("Reason is required when denying a proposal");
            }
            proposal.setStatus(ProjectStatus.DENIED);
            proposal.setReason(reason);
        } else {
            throw new IllegalArgumentException("Invalid status. Only 'APPROVED' or 'DENIED' are allowed.");
        }

        return ppRepo.save(proposal);
    }

  //delete a proposal
  @Transactional
  public String deleteProjectProposal(int id, int userId) {
      ProjectProposal proposal = ppRepo.findById(id)
              .orElseThrow(() -> new RuntimeException("Project proposal with ID " + id + " not found"));

      // Check if the current user is the owner
      if (proposal.getProposedBy().getUid() != userId) {
          throw new IllegalArgumentException("You are not authorized to delete this proposal.");
      }

      if (!proposal.getIsDeleted()) {
          // 1) flag as deleted
          proposal.setDeleted(true);
          // 2) null out the FK so it won't block any team deletes
          proposal.setTeamProject(null);
          // 3) persist immediately
          ppRepo.saveAndFlush(proposal);
          return "Project proposal with ID " + id + " has been deleted.";
      } else {
          return "Project proposal with ID " + id + " is already deleted.";
      }
  }

    //denied to pending
    @Transactional
    public void updateDeniedToPending(int proposalId) {
        ProjectProposal proposal = ppRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found with ID: " + proposalId));

        if (ProjectStatus.DENIED.name().equalsIgnoreCase(proposal.getStatus().name())) {
            proposal.setStatus(ProjectStatus.PENDING);
            proposal.setReason(null);
            ppRepo.save(proposal);
        } else {
            throw new RuntimeException("Proposal is not in DENIED status");
        }
    }

   //approved to open
   @Transactional
   public void updateApprovedToOpenProject(int proposalId, int userId) {
       ProjectProposal proposal = ppRepo.findById(proposalId)
               .orElseThrow(() -> new RuntimeException("Proposal not found with ID: " + proposalId));

       // only the original owner can open it
       if (proposal.getProposedBy().getUid() != userId) {
           throw new IllegalArgumentException("You are not authorized to update this proposal.");
       }

       if (proposal.getStatus() == ProjectStatus.APPROVED) {
           // 1) mark it OPEN…
           proposal.setStatus(ProjectStatus.OPEN);
           // 2) …and null out the owning team FK so it truly becomes un‐assigned
           proposal.setTeamProject(null);

           ppRepo.save(proposal);
       } else {
           throw new RuntimeException("Proposal is not in APPROVED status");
       }
   }

    //take over the project
    @Transactional
    public void takeOwnershipOfProject(int proposalId, int userId) {
        ProjectProposal proposal = ppRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Project proposal with ID " + proposalId + " not found"));

        if (proposal.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("Only OPEN projects can be claimed.");
        }

        User user = uRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Team newTeam = tRepo.findTeamByStudentAndClass((long) userId, proposal.getClassProposal().getCid());
        proposal.setProposedBy(user);
        proposal.setTeamProject(newTeam);
        proposal.setStatus(ProjectStatus.APPROVED);

        ppRepo.save(proposal);
    }

    //project rating
    @Transactional
    public void rateProjectProposal(int proposalId, int userId, String ratings) {
        if (!ratings.matches("\\d(\\.\\d{1,2})?")) {
            throw new IllegalArgumentException("Invalid rating format. Must be a number (e.g., '4' or '4.5').");
        }

        ProjectProposal proposal = ppRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Project proposal with ID " + proposalId + " not found"));

        Classes projectClass = proposal.getClassProposal();
        if (projectClass.getCreatedBy().getUid() != userId) {
            throw new RuntimeException("Only the class creator can rate the project.");
        }

        proposal.setRatings(ratings);
        ppRepo.save(proposal);
    }













}