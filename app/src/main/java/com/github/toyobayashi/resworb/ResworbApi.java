package com.github.toyobayashi.resworb;

import android.app.Activity;
import android.view.Gravity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.google.gson.Gson;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.json.JSONException;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

public class ResworbApi {
  private WebView wv;
  private Gson gson;
  private Activity activity;
  private FileSystemUtil fs;

  private Toast _t = null;

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
        String js = "__resworb_callbacks__['" + promiseId + "'].resolve('" + data + "')";
        wv.evaluateJavascript(js, null);
      }
    });
  }

  private void reject(final String promiseId, final Exception err) {
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        String js = "__resworb_callbacks__['" + promiseId + "'].reject(new Error('" + err.toString() + "'))";
        wv.evaluateJavascript(js, null);
      }
    });
  }

  private void reject(final String promiseId, final String errConstructor, final Exception err) {
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        String js = "__resworb_callbacks__['" + promiseId + "'].reject(new " + errConstructor + "('" + err.toString() + "'))";
        wv.evaluateJavascript(js, null);
      }
    });
  }

  private void toast(final String promiseId, final JsonObject arg) {
    if (!arg.has("message")) {
      reject(promiseId, "TypeError", new Exception("message undefined"));
      return;
    }
    int duration = arg.has("duration") ? arg.get("duration").getAsInt() : Toast.LENGTH_SHORT;
    if (_t != null) _t.cancel();
    _t = Toast.makeText(activity, arg.get("message").getAsString(), duration);

    if (arg.has("gravity")) {
      String gravityString = arg.get("gravity").getAsString();
      int g = Gravity.BOTTOM;
      switch (gravityString) {
        case "center": g = Gravity.CENTER; break;
        case "top": g = Gravity.TOP; break;
        default: g = Gravity.BOTTOM; break;
      }
      _t.setGravity(g, 0, 0);
    }

    _t.show();
    resolve(promiseId, "");
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
    if (methodName.equals("process_arch")) {
      return gson.toJson(Process.arch());
    }
    if (methodName.equals("process_pid")) {
      return gson.toJson(Process.pid());
    }
    if (methodName.equals("process_cwd")) {
      return gson.toJson(Process.cwd());
    }
    if (methodName.equals("process_exit")) {
      Process.exit(gson.fromJson(arg, int.class));
      return "";
    }
    if (methodName.equals("process_env")) {
      Map<String, String> env = Process.env();
      Gson mapGson = new GsonBuilder().enableComplexMapKeySerialization().create();
      return mapGson.toJson(env);
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
