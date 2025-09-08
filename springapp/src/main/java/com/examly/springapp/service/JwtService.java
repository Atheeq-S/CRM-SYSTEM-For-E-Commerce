package com.examly.springapp.service;

import com.examly.springapp.model.User;
import com.examly.springapp.model.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${app.jwt.secret:Zmfrzlcnjdfzvbnhlyzlcnjrlkxtxdbhmlzst256bipzslnfgjwpkz}")
    private String secret;

    @Value("${app.jwt.expirationMs:86400000}") // 1 day default
    private long jwtExpirationMs;

    public String generateToken(User user) {
        try {
            logger.info("Generating JWT token for user: {}", user.getUsername());
            logger.info("JWT secret length: {}", secret.length());
            logger.info("JWT expiration: {} ms", jwtExpirationMs);

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            logger.info("JWT claims: {}", claims);

            String token = createToken(claims, user.getUsername());
            logger.info("JWT token generated successfully, length: {}", token.length());
            return token;
        } catch (Exception e) {
            logger.error("Error generating JWT token for user: {}", user.getUsername(), e);
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public UserRole validateAndGetRole(String token) {
        try {
            Claims claims = extractAllClaims(token);
            String role = claims.get("role", String.class);
            if (role == null)
                return null;
            return UserRole.valueOf(role);
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration.before(new Date());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
