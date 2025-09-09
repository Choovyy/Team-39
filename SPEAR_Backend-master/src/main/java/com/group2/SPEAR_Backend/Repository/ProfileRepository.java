package com.group2.SPEAR_Backend.Repository;


import com.group2.SPEAR_Backend.Model.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {
    Optional<ProfileEntity> findByUser_Uid(Integer uid);
}
