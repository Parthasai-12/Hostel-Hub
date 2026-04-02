package com.example.backend.repository;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByCategory(ComplaintCategory category);
}
