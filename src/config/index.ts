/**
 * This file contins the config
 * required to run the app
 */
import { config } from "dotenv";

export class Config {
  private static isInitialized: boolean = false;

  public static Init() {
    config();
    this.isInitialized = true;
  }

  public static Get(key: string): string {
    if (!this.isInitialized) {
      this.Init();
    }

    return process.env[key] ?? "";
  }
}
