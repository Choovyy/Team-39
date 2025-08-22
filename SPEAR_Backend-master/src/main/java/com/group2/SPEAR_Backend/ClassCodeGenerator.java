package com.group2.SPEAR_Backend;
import java.security.SecureRandom;

public class ClassCodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int LENGTH = 6;

    public static String generateClassCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder classCode = new StringBuilder(LENGTH);

        for (int i = 0; i < LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            classCode.append(CHARACTERS.charAt(index));
        }

        return classCode.toString();
    }
}
