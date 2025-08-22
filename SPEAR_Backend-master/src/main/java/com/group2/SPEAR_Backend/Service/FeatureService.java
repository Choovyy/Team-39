package com.group2.SPEAR_Backend.Service;

import java.util.List;
import java.util.Optional;

import com.group2.SPEAR_Backend.DTO.FeatureDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.group2.SPEAR_Backend.Model.Feature;
import com.group2.SPEAR_Backend.Model.ProjectProposal;
import com.group2.SPEAR_Backend.Repository.FeatureRepository;
import com.group2.SPEAR_Backend.Repository.ProjectProposalRepository;

@Service
public class FeatureService {

    @Autowired
    private FeatureRepository fRepo;

    @Autowired
    private ProjectProposalRepository ppRepo;

    public void addFeature(List<FeatureDTO> features, int projectId) {
        ProjectProposal project = ppRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project Proposal not found with ID: " + projectId));

        List<Feature> featureEntities = features.stream()
                .map(dto -> new Feature(dto.getFeatureTitle(), dto.getFeatureDescription(), project))
                .toList();

        fRepo.saveAll(featureEntities);
    }

    public List<Feature> getAllFeatures() {
        return fRepo.findAll();
    }

    public List<Feature> getFeaturesByProjectId(int projectId) {
        return fRepo.findByProjectId(projectId);
    }
}
