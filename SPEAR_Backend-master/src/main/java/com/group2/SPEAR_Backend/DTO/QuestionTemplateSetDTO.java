        package com.group2.SPEAR_Backend.DTO;

        import com.group2.SPEAR_Backend.Model.QuestionTemplate;
        import com.group2.SPEAR_Backend.Model.QuestionTemplateSet;
        import com.group2.SPEAR_Backend.Model.QuestionType;
        import java.util.List;
        import java.util.stream.Collectors;

        public class QuestionTemplateSetDTO {
            private Long id;
            private String name;
            private List<QuestionTemplateDTO> questions;
            private Integer createdByUserId;

            public QuestionTemplateSetDTO() {}

            public QuestionTemplateSetDTO(QuestionTemplateSet set) {
                this.id = set.getId();
                this.name = set.getName();
                this.questions = set.getQuestions().stream().map(QuestionTemplateDTO::new).collect(Collectors.toList());
                this.createdByUserId = set.getCreatedBy() != null ? set.getCreatedBy().getUid() : null;

            }

            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }

            public String getName() { return name; }
            public void setName(String name) { this.name = name; }

            public List<QuestionTemplateDTO> getQuestions() { return questions; }
            public void setQuestions(List<QuestionTemplateDTO> questions) { this.questions = questions; }

            public Integer getCreatedByUserId() {
                return createdByUserId;
            }

            public void setCreatedByUserId(Integer createdByUserId) {
                this.createdByUserId = createdByUserId;
            }
        }

