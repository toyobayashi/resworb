package com.github.toyobayashi.resworb;

import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class ResworbClient extends WebViewClient {
  @Override
  public void onPageFinished(WebView view, String url) {
    view.evaluateJavascript("window.dispatchEvent(new Event('resworb'));", null);
  }
}
