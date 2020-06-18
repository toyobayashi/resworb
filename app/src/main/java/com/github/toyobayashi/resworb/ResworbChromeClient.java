package com.github.toyobayashi.resworb;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class ResworbChromeClient extends WebChromeClient {
  @Override
  public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
    AlertDialog.Builder builder = new AlertDialog.Builder(view.getContext());
    builder.setTitle("Alert").setMessage(message);
    builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
      @Override
      public void onClick(DialogInterface dialog, int which) {
        result.confirm();
      }
    });
    builder.setCancelable(false);
    AlertDialog dialog = builder.create();
    dialog.show();
    return true;
  }
}
