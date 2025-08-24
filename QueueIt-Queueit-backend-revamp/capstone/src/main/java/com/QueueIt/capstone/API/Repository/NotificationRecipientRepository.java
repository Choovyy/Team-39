package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.NotificationRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.awt.print.Pageable;
import java.util.List;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {

    List<NotificationRecipient> findTop10ByRecipientIDOrderByNotificationDateTimeGeneratedDesc(Long recipientID);


    @Modifying
    @Query("UPDATE NotificationRecipient nr SET nr.isRead = true WHERE nr.id = :id")
    void markAsRead(@Param("id") Long notificationRecipientID);


}
