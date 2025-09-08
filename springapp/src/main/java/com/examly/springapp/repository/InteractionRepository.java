
package com.examly.springapp.repository;

import com.examly.springapp.model.Interaction;
import com.examly.springapp.model.InteractionStatus;
import com.examly.springapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    // Find by customerId (maintains backward compatibility)
    List<Interaction> findByCustomerId(Long customerId);

    // Find by Customer entity (using the relationship)
    List<Interaction> findByCustomer(Customer customer);

    // Additional query methods using the relationship
    @Query("SELECT i FROM Interaction i WHERE i.customer.id = :customerId")
    List<Interaction> findInteractionsByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT i FROM Interaction i WHERE i.customer.email = :email")
    List<Interaction> findInteractionsByCustomerEmail(@Param("email") String email);

    long countByStatus(InteractionStatus pending);
}