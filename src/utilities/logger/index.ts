import newrelic from "newrelic";

export class Logger {
  public static Init() {
    newrelic.instrument({
      moduleName: "logger",
      onRequire: () => {},
    });
  }
}
