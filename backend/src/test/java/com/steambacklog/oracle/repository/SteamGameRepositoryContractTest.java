package com.steambacklog.oracle.repository;

import com.steambacklog.oracle.entity.SteamGame;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SteamGameRepositoryContractTest {

    @Test
    void testRepositoryInterfaceContract() throws NoSuchMethodException {
        assertTrue(JpaRepository.class.isAssignableFrom(SteamGameRepository.class));

        Method findBySteamId = SteamGameRepository.class.getMethod("findBySteamId", String.class);
        assertEquals(List.class, findBySteamId.getReturnType());

        Method findBySteamIdAndIsBacklogTrue = SteamGameRepository.class.getMethod("findBySteamIdAndIsBacklogTrue", String.class);
        assertEquals(List.class, findBySteamIdAndIsBacklogTrue.getReturnType());

        Method findBySteamIdAndAppId = SteamGameRepository.class.getMethod("findBySteamIdAndAppId", String.class, Long.class);
        assertEquals(Optional.class, findBySteamIdAndAppId.getReturnType());
    }
}
