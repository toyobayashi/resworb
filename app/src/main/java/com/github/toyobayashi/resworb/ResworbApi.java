package com.github.toyobayashi.resworb;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class ResworbApi {
  private static class P extends Object {
    public String a;
    public double b;
  }
  private WebView wv;
  private Gson gson;
  private Activity activity;

  ResworbApi(WebView wv, Activity activity) {
    this.wv = wv;
    this.activity = activity;
    this.gson = new Gson();
  }

  private String toJsonString(Object any) {
    return gson.toJson(any);
  }

  private void test(final String promiseId, final JSONObject arg) throws JSONException {
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          String data = arg.getString("data");
          String js = "resworb.map['" + promiseId + "'].resolve('" + data + "');delete resworb.map['" + promiseId + "']";
          wv.evaluateJavascript(js, null);
        } catch (JSONException e) {
          String js = "resworb.map['" + promiseId + "'].reject(new Error('JSONException: " + e.toString() + "'));delete resworb.map['" + promiseId + "']";
          wv.evaluateJavascript(js, null);
        }
      }
    });
  }

  @JavascriptInterface
  public void invoke(String methodName, final String promiseId, String arg) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    Method method = ResworbApi.class.getDeclaredMethod(methodName, String.class, JSONObject.class);
    JSONObject obj = null;
    try {
      obj = new JSONObject(arg);
    } catch (final JSONException e) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          final String js = "resworb.map['" + promiseId + "'].reject(new Error('JSONException: " + e.toString() + "'));delete resworb.map['" + promiseId + "']";
          wv.evaluateJavascript(js, null);
        }
      });
      return;
    }
    method.invoke(this, promiseId, obj);
  }
}
