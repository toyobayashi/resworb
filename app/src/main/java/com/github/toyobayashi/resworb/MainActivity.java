package com.github.toyobayashi.resworb;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends AppCompatActivity {

  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    WebView wv = findViewById(R.id.webview);
    WebSettings webSettings = wv.getSettings();
    webSettings.setJavaScriptEnabled(true);
    webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
    wv.setWebChromeClient(new ResworbChromeClient());
    wv.setWebViewClient(new ResworbClient(this));
    wv.addJavascriptInterface(new ResworbApi(wv, MainActivity.this), "resworb");
    wv.loadUrl("file:///android_asset/index.html");

    wv.evaluateJavascript("document.write('789456')", null);
  }
}