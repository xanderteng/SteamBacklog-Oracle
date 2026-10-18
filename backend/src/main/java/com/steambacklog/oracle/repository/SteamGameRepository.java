package com.steambacklog.oracle.repository;

import com.steambacklog.oracle.entity.SteamGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SteamGameRepository extends JpaRepository<SteamGame, Long> {

    List<SteamGame> findBySteamId(String steamId);

    List<SteamGame> findBySteamIdAndIsBacklogTrue(String steamId);

    Optional<SteamGame> findBySteamIdAndAppId(String steamId, Long appId);
}
