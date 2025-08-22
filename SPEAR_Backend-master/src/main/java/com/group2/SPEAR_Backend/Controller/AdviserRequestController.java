package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.AdviserRequestDTO;
import com.group2.SPEAR_Backend.Model.AdviserRequest;
import com.group2.SPEAR_Backend.Service.AdviserRequestService;
import com.group2.SPEAR_Backend.Service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://10.147.17.37:5173",
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8081",
        "http://172.16.103.209:3000",
        "http://172.16.103.209",
        "http://172.16.103.209:8081"
})
public class AdviserRequestController {

    @Autowired
    private AdviserRequestService reqService;

    @Autowired
    private TeamService teamService;

    @PostMapping("/team/{teamId}/request-adviser")
    public ResponseEntity<?> submitRequest(@PathVariable int teamId, @RequestBody Map<String, Integer> body) {
        int adviserId = body.get("adviserId");
        int scheduleId = body.get("scheduleId");
        AdviserRequest req = reqService.submitRequest(teamId, adviserId, scheduleId);
        return ResponseEntity.ok(Map.of(
                "message", "Adviser request submitted successfully.",
                "requestId", req.getArid()
        ));
    }

    @PutMapping("/adviser-request/{requestId}/review")
    public ResponseEntity<?> reviewRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body) {

        boolean accept = (Boolean) body.get("accept");
        String reason = (String) body.getOrDefault("reason", null);

        reqService.reviewRequest(requestId, accept, reason);
        return ResponseEntity.ok(Map.of(
                "message", accept ? "Adviser request accepted." : "Adviser request rejected."
        ));
    }

    @GetMapping("/team/{teamId}/requests")
    public ResponseEntity<List<AdviserRequestDTO>> getRequestsByTeam(@PathVariable int teamId) {
        return ResponseEntity.ok(reqService.getRequestsByTeamDTO(teamId));
    }

    @PostMapping("/advisory-requests/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId) {
        reqService.reviewRequest(requestId, true, null);
        return ResponseEntity.ok(Map.of("message", "Adviser request accepted."));
    }

    @PostMapping("/advisory-requests/{requestId}/decline")
    public ResponseEntity<?> declineRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Rejected by adviser.");
        reqService.reviewRequest(requestId, false, reason);
        return ResponseEntity.ok(Map.of("message", "Adviser request declined."));
    }

    @GetMapping("team/{teamId}/get-all-requests")
    public ResponseEntity<List<AdviserRequestDTO>> getAllRequestsByTeam(@PathVariable int teamId) {
        List<AdviserRequestDTO> requests = reqService.getAllRequestsByTeamDTO(teamId);
        return ResponseEntity.ok(requests);
    }

    @DeleteMapping("/advisory-requests/{requestId}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long requestId) {
        reqService.deleteRequest(requestId);
        return ResponseEntity.ok(Map.of("message", "Request deleted successfully."));
    }

    @GetMapping("/adviser/{adviserId}/all-requests")
    public ResponseEntity<List<AdviserRequestDTO>> getAllRequestsForAdviser(@PathVariable int adviserId) {
        List<AdviserRequestDTO> dtos = reqService.getAllRequestsForAdviserDTO(adviserId);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/adviser/{adviserId}/accepted-requests")
    public ResponseEntity<List<AdviserRequestDTO>> getAcceptedRequests(@PathVariable int adviserId) {
        return ResponseEntity.ok(reqService.getAcceptedRequestsForAdviser(adviserId));
    }

    @GetMapping("/adviser/{adviserId}/pending-requests")
    public ResponseEntity<List<AdviserRequestDTO>> getPendingRequests(@PathVariable int adviserId) {
        List<AdviserRequestDTO> dtos = reqService.getRequestsForAdviserDTO(adviserId);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/adviser/{adviserId}/rejected-requests")
    public ResponseEntity<List<AdviserRequestDTO>> getRejectedRequests(@PathVariable int adviserId) {
        return ResponseEntity.ok(reqService.getRejectedRequestsForAdviser(adviserId));
    }

    @GetMapping("/adviser/{adviserId}/requests/{status}")
    public ResponseEntity<List<AdviserRequestDTO>> getRequestsByAdviserAndStatus(
            @PathVariable int adviserId,
            @PathVariable String status) {
        return ResponseEntity.ok(reqService.getRequestsForAdviserByStatus(adviserId, status.toUpperCase()));
    }



    //this official request
    @PostMapping("/team/{teamId}/leave-adviser")
    public ResponseEntity<?> submitLeaveRequest(
            @PathVariable int teamId,
            @RequestBody Map<String, Object> body) {

        int requesterId = (int) body.get("requesterId");
        String reason = (String) body.getOrDefault("reason", "No reason provided.");

        try {
            AdviserRequest request = reqService.submitLeaveRequest(teamId, requesterId, reason);
            return ResponseEntity.ok(Map.of(
                    "message", "Leave adviser request submitted.",
                    "requestId", request.getArid()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //rejection
    @PostMapping("/advisory-requests/{requestId}/handle-leave")
    public ResponseEntity<?> handleLeaveRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body) {

        boolean approve = (Boolean) body.get("approve");
        String reason = (String) body.getOrDefault("reason", null);

        try {
            reqService.handleLeaveRequest(requestId, approve, reason);
            return ResponseEntity.ok(Map.of("message", approve ? "Leave request approved and adviser dropped." : "Leave request rejected."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //leave yesyesyes
    @PostMapping("/team/{teamId}/drop-adviser")
    public ResponseEntity<?> dropAdviserAndSchedule(
            @PathVariable int teamId,
            @RequestBody Map<String, Object> body) {

        int requesterId = (int) body.get("requesterId");

        try {
            String message = teamService.dropAdviserAndSchedule(teamId, requesterId);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }




}