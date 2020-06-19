package com.github.toyobayashi.resworb;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.google.gson.Gson;

import org.json.JSONArray;
import com.google.gson.JsonObject;

import org.json.JSONException;
import org.json.JSONStringer;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class ResworbApi {
  private WebView wv;
  private Gson gson;
  private Activity activity;
  private FileSystemUtil fs;

  ResworbApi(WebView wv, Activity activity) {
    this.wv = wv;
    this.activity = activity;
    this.gson = new Gson();
    this.fs = new FileSystemUtil(activity);
  }

  private void resolve(final String promiseId, final String data) {
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        String js = "resworb.map['" + promiseId + "'].resolve('" + data + "')";
        wv.evaluateJavascript(js, null);
      }
    });
  }

  private void reject(final String promiseId, final Exception err) {
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        String js = "resworb.map['" + promiseId + "'].reject(new Error('" + err.toString() + "'))";
        wv.evaluateJavascript(js, null);
      }
    });
  }

  private void test(final String promiseId, final JsonObject arg) {
    resolve(promiseId, gson.toJson(arg.get("data").getAsString() + " result"));
  }

  @JavascriptInterface
  public String invokeSync(String methodName, String arg) throws IOException, FileSystemException, JSONException {
    if (methodName.equals("readFileSync")) {
      String res = gson.toJson(fs.readFile(arg));
      return res;
    }
    if (methodName.equals("existsSync")) {
      return gson.toJson(fs.exists(arg));
    }
    if (methodName.equals("statSync")) {
      return gson.toJson(fs.stat(arg));
    }
    return "";
  }

  @JavascriptInterface
  public String invoke(String methodName, final String promiseId, String arg) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    JsonObject obj = null;
    obj = gson.fromJson(arg, JsonObject.class);
    Method method = ResworbApi.class.getDeclaredMethod(methodName, String.class, JsonObject.class);
    method.invoke(this, promiseId, obj);
    return "";
  }
}
