/*
 * Copyright (C) 2017 VSCT
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, OnInit} from "@angular/core";
import {MonitoringService} from "../monitoring.service";
import {UserReport, UserSearchQuery} from "../model/users";
import {StateService} from "tock-nlp-admin/src/app/core/state.service";
import {DialogReport, DialogReportRequest} from "../model/dialogs";

@Component({
  selector: 'tock-user-timelines',
  templateUrl: './user-timelines.component.html',
  styleUrls: ['./user-timelines.component.css']
})
export class UserTimelinesComponent implements OnInit {

  filter: UserFilter = new UserFilter();
  users: UserReport[] = [];
  userDialog: DialogReport;

  cursor: number = 0;
  pageSize: number = 10;
  total: number = -1;
  loading: boolean = false;

  private currentApplicationUnsuscriber: any;
  private currentLocaleUnsuscriber: any;

  constructor(private state: StateService, private monitoring: MonitoringService) {
  }

  ngOnInit() {
    this.load();
    this.currentApplicationUnsuscriber = this.state.currentApplicationEmitter.subscribe(_ => this.refresh());
    this.currentLocaleUnsuscriber = this.state.currentLocaleEmitter.subscribe(_ => this.refresh());
  }

  private buildUserSearchQuery(): UserSearchQuery {
    const app = this.state.currentApplication;
    const language = this.state.currentLocale;
    return new UserSearchQuery(
      app.namespace,
      app.name,
      language,
      this.cursor,
      this.cursor + this.pageSize,
      this.filter.name,
      this.filter.from,
      this.filter.to);
  }

  ngOnDestroy() {
    this.currentApplicationUnsuscriber.unsubscribe();
    this.currentLocaleUnsuscriber.unsubscribe();
  }

  refresh() {
    this.loading = false;
    this.cursor = 0;
    this.total = -1;
    this.users = [];
    this.load();
  }

  load() {
    if (!this.loading && (this.total === -1 || this.total > this.cursor)) {
      this.loading = true;
      this.monitoring.users(this.buildUserSearchQuery()).subscribe(r => {
        Array.prototype.push.apply(this.users, r.users);
        this.cursor = r.end;
        this.total = r.total;
        this.loading = false;
        if(!this.userDialog && this.users.length > 0) {
           this.loadDialog(this.users[0]);
        }
      });
    }
  }

  onScroll() {
    this.load();
  }

  private buildDialogQuery(user: UserReport): DialogReportRequest {
    const app = this.state.currentApplication;
    const language = this.state.currentLocale;
    return new DialogReportRequest(
      app.namespace,
      app.name,
      language,
      user.playerId);
  }

  loadDialog(user: UserReport) {
    this.monitoring.dialogs(this.buildDialogQuery(user)).subscribe(r => {
      this.userDialog = r;
    });
  }

}

export class UserFilter {
  constructor(public name?: string,
              public from?: Date,
              public to?: Date) {
  }
}