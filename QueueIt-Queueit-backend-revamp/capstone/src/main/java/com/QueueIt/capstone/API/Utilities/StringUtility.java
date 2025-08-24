package com.QueueIt.capstone.API.Utilities;

public class StringUtility {
    public static String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input; // Return the input as is if it's null or empty
        }

        // Convert the first letter to uppercase and the rest to lowercase
        String firstLetter = input.substring(0, 1).toUpperCase();
        String restOfString = input.substring(1).toLowerCase();

        return firstLetter + restOfString;
    }

    public static String randomBackgroundColorString(int e) {
        String[] colors = {
                "#CCFC57",
                "#9E88F4",
                "#7D57FC",
                "#7551FF",
                "#E9EDF7",
                "#D4C8FF",
                "#9A7FFF",
        };

        return colors[e];
    }
}
