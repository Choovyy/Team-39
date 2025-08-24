//package com.QueueIt.capstone.API.Services;
//
//import com.QueueIt.capstone.API.Entities.*;
//import com.QueueIt.capstone.API.Misc.TimeFormatter;
//import com.QueueIt.capstone.API.Repository.*;
//import com.QueueIt.capstone.API.Requests.AdviserOpenCloseQueueRequest;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.messaging.simp.SimpMessageSendingOperations;
//import org.springframework.stereotype.Service;
//
//import java.sql.Time;
//import java.util.Comparator;
//import java.util.NoSuchElementException;
//
//@Service
//public class QueueService {
//
//    @Autowired
//    private SimpMessageSendingOperations simpMessageSendingOperations;
//
//    @Autowired
//    private MeetingRepository meetingRepository;
//
//    @Autowired
//    private QueueingGroupsRepository queueingGroupsRepository;
//
//    @Autowired
//    private TimeFormatter timeFormatter;
//
//    public ResponseEntity<Object> adviserOpenQueue(AdviserOpenCloseQueueRequest adviserOpenCloseQueueRequest) {
//        try{
//            //update adviser queueing status
//            Adviser adviser = adviserRepository.findById(adviserOpenCloseQueueRequest.getAdviserID()).orElseThrow();
//            //set kung kinsa ang pwede mo queue nga classID
//            if (adviserOpenCloseQueueRequest.getCateringClasses().size() != 1 && adviserOpenCloseQueueRequest.getCateringClasses().contains((long) 0)){
//                return ResponseEntity.badRequest().body("All classrooms filter must not be included");
//            }else{
//                adviser.setCateringClasses(adviserOpenCloseQueueRequest.getCateringClasses());
//            }
//            //set nga ready na ang adviser for queueing
//            adviser.setReady(Boolean.TRUE);
//            //set ang intro message nga mo gawas sa chat feed inig sulod ni student sa queueing page
//            adviser.setIntroMessage(adviserOpenCloseQueueRequest.getMessage());
//            adviserRepository.save(adviser);
//
//            //update queueing groups object
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviser.getUser().getUserID());
//            //set kanus-a kutob ang queueing
//            if(adviserOpenCloseQueueRequest.getTimeEnds() != null){
//                queueingManager.setTimeEnds(timeFormatter.parseStringToTimeHoursAndMinutesInputOnly(adviserOpenCloseQueueRequest.getTimeEnds()));
//            }
//            //set pila ra kabuok limit sa linya for today.
//            queueingManager.setCateringLimit(adviserOpenCloseQueueRequest.getCateringLimit());
//            //set is active kay if dili active, palayason tanan users nga nag access sa queueing page.
//            queueingManager.setActive(Boolean.TRUE);
//            queueingGroupsRepository.save(queueingManager);
//
//            //broadcast to subscribers after saving
//            simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/"+adviser.getUser().getUserID(),adviser);
//            return ResponseEntity.ok("Successfully opened queueing.");
//        }catch (NoSuchElementException e){
//            return ResponseEntity.status(404).body("Queueing groups or adviser does not exist. Please contact administrator.");
//        }
//    }
//    public ResponseEntity<Object> adviserCloseQueue(AdviserOpenCloseQueueRequest adviserOpenCloseQueueRequest) {
//        try{
//            //update adviser queueing status
//            Adviser adviser = adviserRepository.findById(adviserOpenCloseQueueRequest.getAdviserID()).orElseThrow();
//            //set nga dili na siya ready for queueing
//            adviser.setReady(Boolean.FALSE);
//            //clear, meaning mo cater siya tanan classes / groups
//            if(adviser.getCateringClasses() != null){
//                adviser.getCateringClasses().clear();
//            }
//            //reset ang intro message
//            adviser.setIntroMessage(null);
//            adviserRepository.save(adviser);
//
//            //update queueing groups
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviser.getUser().getUserID());
//            //clear ang queueing time range
//            queueingManager.setTimeEnds(null);
//            //set catering limit to 0
//            queueingManager.setCateringLimit((long) -1);
//            //set is active kay if dili active, palayason tanan users nga nag access sa queueing page.
//            queueingManager.setActive(Boolean.FALSE);
//
//            //katong logic nga ang mga naka onhold or wala ma cater ni adviser nga naka queue, i cater next open.
//
//
//            queueingGroupsRepository.save(queueingManager);
//
//            //broadcast after saving
//            simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/"+adviser.getUser().getUserID(),adviser);
//            return ResponseEntity.ok("Successfully terminated queueing.");
//        }catch (NoSuchElementException e){
//            return ResponseEntity.status(404).body("Adviser not found or QueueingGroup not found. Please contact administrator.");
//        }
//    }
//
//    public ResponseEntity<Object> adviserAdmitQueueingTeam(Long adviserID, Long groupID) {
//        try{
//            //get the group
//            Group group = groupRepository.findById(groupID).orElseThrow();
//            //get the adviser
//            Adviser adviser = adviserRepository.findById(adviserID).orElseThrow();
//            //get the queueing groups for manipulation
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviser.getUser().getUserID());
//
//            //if si team nga gi admit is onHold, then return bad request [for double security]
//            if(queueingManager.getOnHoldGroups().contains(group)){
//                return ResponseEntity.badRequest().build();
//            }
//            //set si group to tending team
//            queueingManager.setTendingGroup(group);
//            //ibot si group sa queueing groups
//            queueingManager.getQueueingGroups().remove(group);
//            //minusan ang catering limit
//            if (queueingManager.getCateringLimit() > 1){
//                queueingManager.setCateringLimit(queueingManager.getCateringLimit()-1);
//            }
//            queueingGroupsRepository.save(queueingManager);
//
//            //set meeting starting date/time to now.
//            Meeting meeting = new Meeting(adviserID,groupID);
//            meeting.setStart(new Time(System.currentTimeMillis()));
//
//            //save
//            meetingRepository.save(meeting);
//
//            simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/tendingTeam/"+adviser.getUser().getUserID(),group);
//            simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/dequeue/"+adviser.getUser().getUserID(),group);
//
//            //i return si meetingID para inig conclude sa meeting, ma manipulate ang time end.
//            return ResponseEntity.ok(meeting.getMeetingID());
//        }catch (NoSuchElementException e){
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    public ResponseEntity<Object> adviserConcludeMeeting(Long meetingID) {
//        try{
//            //get meeting or throw exception if wala
//            Meeting meeting = meetingRepository.findById(meetingID).orElseThrow();
//            //get adviser
//            Adviser adviser = adviserRepository.findById(meeting.getAdviserID()).orElseThrow();
//            //get queueing groups to manipulate tending groups
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviser.getUser().getUserID());
//            //set meeting end date/time to now
//            meeting.setEnd(new Time(System.currentTimeMillis()));
//            //set queueing groups tending group to null;
//            queueingManager.setTendingGroup(null);
//            //save queueing groups
//            queueingGroupsRepository.save(queueingManager);
//            //save meeting
//            meetingRepository.save(meeting);
//            //returnan lang nako ug true, sa frontend lang nako i set ang tending team to null para gamay ra bandwidth kaunon;
//            simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/concludeMeeting/"+adviser.getUser().getUserID(),Boolean.TRUE);
//            simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/tendingTeam/"+adviser.getUser().getUserID(),Boolean.FALSE);
//            return ResponseEntity.ok("Meeting concluded.");
//        }catch (NoSuchElementException e){
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    public ResponseEntity<Object> getQueueingTeams(Long adviserID) {
//        try{
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviserID);
//            queueingManager.getQueueingGroups().sort(Comparator.comparing(Group::getQueueingTimeStart));
//            queueingManager.getOnHoldGroups().sort(Comparator.comparing(Group::getQueueingTimeStart));
//            return ResponseEntity.ok(queueingManager);
//        }catch (NoSuchElementException nse){
//            return ResponseEntity.status(404).body("Adviser not found.");
//        }catch (Exception e){
//            return ResponseEntity.status(500).build();
//        }
//    }
//
//
//    public ResponseEntity<Object> studentEnqueue(Long adviserID, Long groupID) {
//        try{
//            //first gipangita nako ang adviser
//            Adviser adviser = adviserRepository.findById(adviserID).orElseThrow();
//
//            //cateringClasses is array, so di mahitabo nga null siya, so if empty siya, wala ma tarong ug filter sa frontend, or naay ni try ug access via backdoor sa API
//            if (adviser.getCateringClasses().isEmpty()){
//                return ResponseEntity.unprocessableEntity().body("Class filter is empty.");
//            }
//
//            //if nakalahos, kuha sa queueing groups ug group entities.
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviserID);
//            Group group = groupRepository.findById(groupID).orElseThrow();
//
//            //if galinya na daan ang group, so of course, return nata.
//            if (queueingManager.getQueueingGroups().contains(group)){
//                return ResponseEntity.badRequest().body("Group already in queue");
//            }
//
//            //if nakalusot, kuhaon ang classroom
//            Classroom classroom = classroomRepository.findById(group.getClassID()).orElseThrow();
//            //i check if naapil siya sa filter or ang filter sa adviser kay All Classroom which is ang value kay 0
//            if ((adviser.getCateringClasses().contains(classroom.getClassID()) || adviser.getCateringClasses().contains((long) 0)) && (queueingManager.getCateringLimit() == 0 || queueingManager.getCateringLimit() - (queueingManager.getQueueingGroups().size()+ queueingManager.getOnHoldGroups().size()) > 0)){
//                group.setQueueingTimeStart(new Time(System.currentTimeMillis()));
//                group.setQueueing(Boolean.TRUE);
//                groupRepository.save(group);
//                queueingManager.getQueueingGroups().add(group);
////                ako sa i comment ang pag set sa catering limit, kay sa admit button rako mag minus sa catering limit, para mag agad nalang sa adviser, dili sa linya
////                queueingGroups.setCateringLimit(queueingGroups.getCateringLimit()-1);
//                queueingGroupsRepository.save(queueingManager);
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/adviser/enqueue/"+adviserID,group);
//                group.getStudents().clear();
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/enqueue/"+adviserID,group);
//                return ResponseEntity.ok("Group enqueued");
//            }
//            //then queueing limit exceeded if naka lapos
//            if (queueingManager.getCateringLimit() - (queueingManager.getQueueingGroups().size()+ queueingManager.getOnHoldGroups().size()) == 0){
//                return ResponseEntity.unprocessableEntity().body("Queueing limit exceeded");
//            }
//            //if nakalapos, then something went wrong.
//            return ResponseEntity.badRequest().body("Something went wrong");
//        }catch (NoSuchElementException e){
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    public ResponseEntity<Object> studentDequeue(Long adviserID, Long groupID){
//        try{
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviserID);
//            Group group = groupRepository.findById(groupID).orElseThrow();
//            if (queueingManager.getQueueingGroups().contains(group)){
//                group.setQueueingTimeStart(null);
//                group.setQueueing(Boolean.FALSE);
//                groupRepository.save(group);
//                queueingManager.getQueueingGroups().remove(group);
//                queueingGroupsRepository.save(queueingManager);
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/adviser/dequeue/"+adviserID,group);
//                group.getStudents().clear();
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/dequeue/"+adviserID,group);
//                return ResponseEntity.ok("Group dequeued");
//            } else if (queueingManager.getOnHoldGroups().contains(group)) {
//                group.setQueueingTimeStart(null);
//                groupRepository.save(group);
//                queueingManager.getOnHoldGroups().remove(group);
//                queueingGroupsRepository.save(queueingManager);
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/adviser/dequeue/"+adviserID,group);
//                group.getStudents().clear();
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/dequeue/"+adviserID,group);
//                return ResponseEntity.ok("Group dequeued");
//            }else{
//                return ResponseEntity.notFound().build();
//            }
//        }catch (NoSuchElementException e){
//            return ResponseEntity.status(404).body("Student not found");
//        }
//    }
//
//
//    public ResponseEntity<Object> studentHoldQueue(Long adviserID, Long groupID) {
//        try{
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviserID);
//            Group group = groupRepository.findById(groupID).orElseThrow();
//            if (queueingManager.getQueueingGroups().contains(group)){
//                //ibot sa queueing groups
//                queueingManager.getQueueingGroups().remove(group);
//                //sulod sa on hold groups
//                queueingManager.getOnHoldGroups().add(group);
//                //i sort via queueing Start
//                queueingManager.getOnHoldGroups().sort(Comparator.comparing(Group::getQueueingTimeStart));
//                //save
//                queueingGroupsRepository.save(queueingManager);
//                simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/onHold/"+adviserID,group);
//                return ResponseEntity.ok("Group set to hold");
//            }
//            return ResponseEntity.notFound().build();
//        }catch (NoSuchElementException e){
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    public ResponseEntity<Object> studentRequeue(Long adviserID, Long groupID) {
//        try{
//            QueueingManager queueingManager = queueingGroupsRepository.findByAdviserID(adviserID);
//            Group group = groupRepository.findById(groupID).orElseThrow();
//            queueingManager.getOnHoldGroups().remove(group);
//            queueingManager.getQueueingGroups().add(group);
//            queueingManager.getQueueingGroups().sort(Comparator.comparing(Group::getQueueingTimeStart));
//            queueingGroupsRepository.save(queueingManager);
//            simpMessageSendingOperations.convertAndSend("/topic/queueingTeamsStatus/student/requeue/"+adviserID,group);
//            return ResponseEntity.ok("Group requeued");
//        }catch (NoSuchElementException e){
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
