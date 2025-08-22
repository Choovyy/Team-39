package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "question_template_sets")
public class QuestionTemplateSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "templateSet", cascade = CascadeType.ALL)
    private Set<QuestionTemplate> questions = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "uid", nullable = false)
    private User createdBy;

    public QuestionTemplateSet() {}

    public QuestionTemplateSet(String name, User createdBy) {
        this.name = name;
        this.createdBy = createdBy;

    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Set<QuestionTemplate> getQuestions() { return questions; }
    public void setQuestions(Set<QuestionTemplate> questions) { this.questions = questions; }


    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}

