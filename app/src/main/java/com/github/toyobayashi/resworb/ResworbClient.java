package com.github.toyobayashi.resworb;

import android.app.Activity;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class ResworbClient extends WebViewClient {
  private FileSystemUtil fs;
  ResworbClient(Activity activity) {
    this.fs = new FileSystemUtil(activity);
  }

  private void evaluateJavascript(WebView view, final String path) {
    String js = "";
    try {
      js = new String(fs.readFile(path), StandardCharsets.UTF_8);
    } catch (FileSystemException | IOException e) {
      view.evaluateJavascript("throw new Error('" + e.toString() + "')", null);
      return;
    }
    view.evaluateJavascript(js, null);
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    evaluateJavascript(view, "file:///android_asset/resworb.js");
  }
}
