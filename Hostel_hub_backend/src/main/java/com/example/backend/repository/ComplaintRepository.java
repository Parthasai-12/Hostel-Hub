package com.example.backend.repository;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByCategory(ComplaintCategory category);

    List<Complaint> findByStatus(Complaint.Status status);

    List<Complaint> findByCategoryAndStatus(ComplaintCategory category, Complaint.Status status);

    @Query("SELECT c FROM Complaint c WHERE c.status <> 'RESOLVED' AND c.createdAt >= :dateThreshold")
    List<Complaint> findUnresolvedRecentComplaints(@Param("dateThreshold") LocalDateTime dateThreshold);

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN c.affectedStudents s WHERE c.user.id = :userId OR s.id = :userId")
    List<Complaint> findByUserIdOrAffectedStudentsId(@Param("userId") Long userId);
}
