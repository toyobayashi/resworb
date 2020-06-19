package com.github.toyobayashi.resworb;

import android.app.Activity;
import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;

public class FileSystemUtil {
  public static class FileStats {
    private boolean dir;
    public long size = 0;
    FileStats (boolean isDir) {
      dir = isDir;
    }

    public boolean isFile() {
      return !dir;
    }

    public boolean isDirector() {
      return dir;
    }
  }
  private Activity activity;
  private HashMap<String, FileStats> assets = null;
  FileSystemUtil(Activity activity) {
    this.activity = activity;
  }

  private boolean isAsset(String path) {
    return path.contains("/android_asset");
  }

  private String resolveAssetPath(String path) {
    if (path.indexOf("file:///android_asset") == 0) {
      String assetPath = path.length() > 21 ? path.substring(22) : "";
      return assetPath;
    } else if (path.indexOf("/file:/android_asset") == 0) {
      String assetPath = path.length() > 20 ? path.substring(21) : "";
      return assetPath;
    } else {
      return path;
    }
  }

  private InputStream getFileInputStream(String path) throws FileSystemException, IOException {
    if (isAsset(path)) {
      String assetPath = resolveAssetPath(path);
      AssetManager am = activity.getAssets();
      return am.open(assetPath);
    }

    File f = new File(path);
    if (!f.exists() || !f.isFile()) {
      throw new FileSystemException("No such file: " + path);
    }
    return new FileInputStream(f);
  }

  public String readFile(String path) throws FileSystemException, IOException {
    InputStream is = getFileInputStream(path);
    int fileSize = is.available();
    byte[] buffer = new byte[fileSize];
    is.read(buffer);
    is.close();
    String res = new String(buffer, StandardCharsets.UTF_8);
    return res;
  }

  private HashMap<String, FileStats> listAssets(String path) throws IOException {
    AssetManager am = activity.getAssets();
    String[] ls = am.list(path);
    HashMap<String, FileStats> map = new HashMap(new LinkedHashMap());
    if (ls == null || ls.length == 0) {
      FileStats stats = new FileStats(false);
      InputStream is = am.open(path);
      stats.size = is.available();
      is.close();
      map.put(path, stats);
    } else {
      map.put(path, new FileStats(true));
      for (String item : ls) {
        HashMap<String, FileStats> subMap = listAssets(path.equals("") ? item : (path + File.separator + item));
        for (HashMap.Entry<String, FileStats> entry : subMap.entrySet()) {
          map.put(entry.getKey(), entry.getValue());
        }
      }
    }
    return map;
  }

  public boolean exists(String path) throws IOException {
    if (isAsset(path)) {
      if (assets == null) {
        assets = listAssets("");
      }

      String assetPath = resolveAssetPath(path);
      return assets.containsKey(assetPath);
    }
    File f = new File(path);
    return f.exists();
  }

  public FileStats stat(String path) throws FileSystemException, IOException {
    if (isAsset(path)) {
      if (assets == null) {
        assets = listAssets("");
      }

      String assetPath = resolveAssetPath(path);
      if (!assets.containsKey(assetPath)) {
        throw new FileSystemException("No such file or directory: " + path);
      }
      return assets.get(assetPath);
    }
    File f = new File(path);
    if (!f.exists()) {
      throw new FileSystemException("No such file or directory: " + path);
    }
    if (f.isDirectory()) {
      return new FileStats(true);
    }
    FileStats stat = new FileStats(false);
    stat.size = f.length();
    return stat;
  }
}
