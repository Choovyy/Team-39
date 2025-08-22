package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.ResponseDTO;
import com.group2.SPEAR_Backend.Model.Response;
import com.group2.SPEAR_Backend.Service.ResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
@RequestMapping("/responses")
public class ResponseController {

    @Autowired
    private ResponseService rServ;

    @PostMapping("/submit")
    public String submitResponses(
            @RequestBody List<Response> responses,
            @RequestParam Long evaluationId,
            @RequestParam int evaluatorId,
            @RequestParam Long classId) {


//        System.out.println("Received " + responses.size() + " responses");
//        responses.forEach(r -> System.out.println("Eval: " + r.getEvaluator() + ", Eval'd: " + r.getEvaluatee()));

        rServ.submitResponses(responses, evaluationId, evaluatorId, classId);
        return "Responses submitted successfully";
    }

    @PostMapping("/submit-adviser")
    public String submitAdviserResponses(
            @RequestBody List<Response> responses,
            @RequestParam Long evaluationId,
            @RequestParam int evaluatorId,
            @RequestParam Long classId) {

        rServ.submitAdviserResponses(responses, evaluationId, evaluatorId, classId);
        return "Adviser responses submitted successfully";
    }

    @GetMapping("/evaluator/{evaluatorId}")
    public List<ResponseDTO> getResponsesByEvaluator(@PathVariable int evaluatorId) {
        return rServ.getResponsesByEvaluator(evaluatorId);
    }

    @GetMapping("/evaluatee/{evaluateeId}")
    public List<ResponseDTO> getResponsesByEvaluatee(@PathVariable int evaluateeId) {
        return rServ.getResponsesByEvaluatee(evaluateeId);
    }

    @GetMapping("/evaluatee/{evaluateeId}/average")
    public double calculateAverageResponse(@PathVariable int evaluateeId) {
        return rServ.calculateAverageResponse(evaluateeId);
    }

    @DeleteMapping("/delete/{rid}")
    public String deleteResponse(@PathVariable Long rid) {
        return rServ.deleteResponse(rid);
    }
    @GetMapping("/get-evaluation/{evaluationId}")
    public List<ResponseDTO> getResponsesByEvaluationId(@PathVariable Long evaluationId) {
        return rServ.getResponsesByEvaluationId(evaluationId);
    }

}