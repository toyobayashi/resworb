package com.github.toyobayashi.resworb;
import java.util.Map;

public class Process {
  public static String arch() {
    return System.getProperty("os.arch");
  }

  public static String cwd() {
    return System.getProperty("user.dir");
  }

  public static int pid() {
    return android.system.Os.getpid();
  }

  public static void exit(int code) {
    System.exit(code);
    // android.os.Process.killProcess(pid());
  }

  public static Map<String, String> env() {
    return System.getenv();
  }
}
