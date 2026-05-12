import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> fruits = Arrays.asList("apple", "banana", "cherry");
        fruits.stream()
              .map(String::toUpperCase)
              .forEach(System.out::println);
    }
}
