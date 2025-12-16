import { BgMail, Email } from "../modeles/BgMail";
import { GmailLabel } from "./gis-gmail.service";

export interface Updatable {
  updateView(): void;
}

export interface onChangeEmailSelected {
  onChangeEmailSelected(email: BgMail): void;
}

export interface onLabelsDownloaded {
  onLabelsDownloaded(labels: Array<GmailLabel>): void;
}