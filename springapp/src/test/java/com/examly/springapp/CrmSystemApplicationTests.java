package com.examly.springapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import com.examly.springapp.config.TestConfig;

@SpringBootTest
@Import(TestConfig.class)
class CrmSystemApplicationTests {

	@Test
	void contextLoads() {
	}

}
