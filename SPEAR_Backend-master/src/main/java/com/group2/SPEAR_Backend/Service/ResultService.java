//package com.group2.SPEAR_Backend.Service;
//
//import com.group2.SPEAR_Backend.DTO.ResultDTO;
//import com.group2.SPEAR_Backend.Model.Evaluation;
//import com.group2.SPEAR_Backend.Model.Response;
//import com.group2.SPEAR_Backend.Model.Result;
//import com.group2.SPEAR_Backend.Model.User;
//import com.group2.SPEAR_Backend.Repository.EvaluationRepository;
//import com.group2.SPEAR_Backend.Repository.ResponseRepository;
//import com.group2.SPEAR_Backend.Repository.ResultRepository;
//import com.group2.SPEAR_Backend.Repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.NoSuchElementException;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class ResultService {
//
//    @Autowired
//    private ResultRepository rRepo;
//
//    @Autowired
//    private ResponseRepository resRepo;
//
//    @Autowired
//    private EvaluationRepository eRepo;
//
//    @Autowired
//    private UserRepository uRepo;
//
//    public Result calculateAndSaveResult(Long evaluationId, int evaluateeId) {
//        Evaluation evaluation = eRepo.findById(evaluationId)
//                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));
//
//        User evaluatee = uRepo.findById(evaluateeId)
//                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + evaluateeId));
//
//        Optional<Result> existingResult = rRepo.findByEvaluationEidAndEvaluateeUid(evaluationId, evaluateeId);
//        if (existingResult.isPresent()) {
//            return existingResult.get();
//        }
//
//        List<Response> responses = resRepo.findByEvaluateeUid(evaluateeId);
//        double totalScore = responses.stream()
//                .filter(response -> response.getEvaluation().getEid().equals(evaluationId))
//                .mapToDouble(Response::getScore)
//                .sum();
//        double averageScore = responses.size() > 0 ? totalScore / responses.size() : 0.0;
//
//        Result result = new Result(evaluatee, evaluation, averageScore);
//        return rRepo.save(result);
//    }
//
//    public List<ResultDTO> getResultsByEvaluatee(int evaluateeId) {
//        return rRepo.findByEvaluateeUid(evaluateeId).stream()
//                .map(this::toDTO)
//                .collect(Collectors.toList());
//    }
//
//    public List<ResultDTO> getResultsByEvaluation(Long evaluationId) {
//        return rRepo.findByEvaluationEid(evaluationId).stream()
//                .map(this::toDTO)
//                .collect(Collectors.toList());
//    }
//
//    private ResultDTO toDTO(Result result) {
//        String evaluateeName = uRepo.findFullNameById(result.getEvaluatee().getUid());
//
//        return new ResultDTO(
//                result.getResultId(),
//                result.getEvaluatee().getUid(),
//                evaluateeName,
//                result.getEvaluation().getEid(),
//                result.getAverageScore()
//        );
//    }
//}
