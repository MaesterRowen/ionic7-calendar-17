import * as i0 from '@angular/core';
import { Injectable, EventEmitter, Output, Input, ViewChild, Component, ViewEncapsulation, HostBinding, LOCALE_ID, Inject, NgModule } from '@angular/core';
import * as i2 from '@angular/common';
import { DatePipe, CommonModule } from '@angular/common';
import * as i2$1 from '@ionic/angular/lazy';
import { IonicModule } from '@ionic/angular/lazy';
import SwiperCore, { Swiper } from 'swiper';
import { Subject } from 'rxjs';
import { IonicSlides } from '@ionic/angular';

class CalendarService {
    constructor() {
        this._currentDate = new Date();
        this.currentDateChangedFromParent = new Subject();
        this.currentDateChangedFromChildren = new Subject();
        this.eventSourceChanged = new Subject();
        this.slideChanged = new Subject();
        this.slideUpdated = new Subject();
        this.currentDateChangedFromParent$ = this.currentDateChangedFromParent.asObservable();
        this.currentDateChangedFromChildren$ = this.currentDateChangedFromChildren.asObservable();
        this.eventSourceChanged$ = this.eventSourceChanged.asObservable();
        this.slideChanged$ = this.slideChanged.asObservable();
        this.slideUpdated$ = this.slideUpdated.asObservable();
    }
    setCurrentDate(val, fromParent = false) {
        this._currentDate = new Date(val);
        if (fromParent) {
            this.currentDateChangedFromParent.next(val);
        }
        else {
            this.currentDateChangedFromChildren.next(val);
        }
    }
    get currentDate() {
        return this._currentDate;
    }
    rangeChanged(component) {
        if (this.queryMode === 'local') {
            if (component.eventSource && component.onDataLoaded) {
                component.onDataLoaded();
            }
        }
        else if (this.queryMode === 'remote') {
            let rangeStart = new Date(component.range.startTime.getTime()), rangeEnd = new Date(component.range.endTime.getTime());
            rangeStart.setHours(0);
            if (rangeStart.getHours() === 23) {
                rangeStart.setTime(rangeStart.getTime() + 3600000);
            }
            rangeEnd.setHours(0);
            if (rangeEnd.getHours() === 23) {
                rangeEnd.setTime(rangeEnd.getTime() + 3600000);
            }
            component.onRangeChanged.emit({
                startTime: rangeStart,
                endTime: rangeEnd
            });
        }
    }
    getStep(mode) {
        switch (mode) {
            case 'month':
                return {
                    years: 0,
                    months: 1,
                    days: 0
                };
            case 'week':
                return {
                    years: 0,
                    months: 0,
                    days: 7
                };
            case 'day':
                return {
                    years: 0,
                    months: 0,
                    days: 1
                };
        }
    }
    getAdjacentCalendarDate(mode, direction) {
        let calculateCalendarDate = this.currentDate;
        const step = this.getStep(mode), year = calculateCalendarDate.getFullYear() + direction * step.years, month = calculateCalendarDate.getMonth() + direction * step.months, date = calculateCalendarDate.getDate() + direction * step.days;
        calculateCalendarDate = new Date(year, month, date, 12, 0, 0);
        if (mode === 'month') {
            const firstDayInNextMonth = new Date(year, month + 1, 1, 12, 0, 0);
            if (firstDayInNextMonth.getTime() <= calculateCalendarDate.getTime()) {
                calculateCalendarDate = new Date(firstDayInNextMonth.getTime() - 24 * 60 * 60 * 1000);
            }
        }
        return calculateCalendarDate;
    }
    getAdjacentViewStartTime(component, direction) {
        let adjacentCalendarDate = this.getAdjacentCalendarDate(component.mode, direction);
        return component.getRange(adjacentCalendarDate).startTime;
    }
    populateAdjacentViews(component) {
        let currentViewStartDate, currentViewData, toUpdateViewIndex, currentViewIndex = component.currentViewIndex;
        if (component.direction === 1) {
            currentViewStartDate = this.getAdjacentViewStartTime(component, 1);
            toUpdateViewIndex = (currentViewIndex + 1) % 3;
            component.views[toUpdateViewIndex] = component.getViewData(currentViewStartDate);
        }
        else if (component.direction === -1) {
            currentViewStartDate = this.getAdjacentViewStartTime(component, -1);
            toUpdateViewIndex = (currentViewIndex + 2) % 3;
            component.views[toUpdateViewIndex] = component.getViewData(currentViewStartDate);
        }
        else {
            if (!component.views) {
                currentViewData = [];
                currentViewStartDate = component.range.startTime;
                currentViewData.push(component.getViewData(currentViewStartDate));
                currentViewStartDate = this.getAdjacentViewStartTime(component, 1);
                currentViewData.push(component.getViewData(currentViewStartDate));
                currentViewStartDate = this.getAdjacentViewStartTime(component, -1);
                currentViewData.push(component.getViewData(currentViewStartDate));
                component.views = currentViewData;
            }
            else {
                currentViewStartDate = component.range.startTime;
                component.views[currentViewIndex] = component.getViewData(currentViewStartDate);
                currentViewStartDate = this.getAdjacentViewStartTime(component, -1);
                toUpdateViewIndex = (currentViewIndex + 2) % 3;
                component.views[toUpdateViewIndex] = component.getViewData(currentViewStartDate);
                currentViewStartDate = this.getAdjacentViewStartTime(component, 1);
                toUpdateViewIndex = (currentViewIndex + 1) % 3;
                component.views[toUpdateViewIndex] = component.getViewData(currentViewStartDate);
            }
        }
    }
    loadEvents() {
        this.eventSourceChanged.next();
    }
    slide(direction) {
        this.slideChanged.next(direction);
    }
    update() {
        this.slideUpdated.next();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: CalendarService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: CalendarService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: CalendarService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

class MonthViewComponent {
    constructor(calendarService, zone) {
        this.calendarService = calendarService;
        this.zone = zone;
        this.autoSelect = true;
        this.dir = '';
        this.lockSwipeToPrev = false;
        this.lockSwipeToNext = false;
        this.lockSwipes = false;
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter();
        this.views = [];
        this.currentViewIndex = 0;
        this.mode = 'month';
        this.direction = 0;
        this.moveOnSelected = false;
        this.inited = false;
    }
    static getDates(startDate, n) {
        const dates = new Array(n), current = new Date(startDate.getTime());
        let i = 0;
        while (i < n) {
            dates[i++] = new Date(current.getTime());
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
    ngOnInit() {
        if (!this.sliderOptions) {
            this.sliderOptions = {};
        }
        this.sliderOptions.loop = true;
        this.sliderOptions.allowSlidePrev = !this.lockSwipeToPrev;
        this.sliderOptions.allowSlideNext = !this.lockSwipeToNext;
        this.sliderOptions.allowTouchMove = !this.lockSwipes;
        if (this.dateFormatter && this.dateFormatter.formatMonthViewDay) {
            this.formatDayLabel = this.dateFormatter.formatMonthViewDay;
        }
        else {
            const dayLabelDatePipe = new DatePipe('en-US');
            this.formatDayLabel = function (date) {
                return dayLabelDatePipe.transform(date, this.formatDay) || '';
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatMonthViewDayHeader) {
            this.formatDayHeaderLabel = this.dateFormatter.formatMonthViewDayHeader;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatDayHeaderLabel = function (date) {
                return datePipe.transform(date, this.formatDayHeader) || '';
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatMonthViewTitle) {
            this.formatTitle = this.dateFormatter.formatMonthViewTitle;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe.transform(date, this.formatMonthTitle) || '';
            };
        }
        this.refreshView();
        this.inited = true;
        this.currentDateChangedFromParentSubscription = this.calendarService.currentDateChangedFromParent$.subscribe(currentDate => {
            this.refreshView();
        });
        this.eventSourceChangedSubscription = this.calendarService.eventSourceChanged$.subscribe(() => {
            this.onDataLoaded();
        });
        this.slideChangedSubscription = this.calendarService.slideChanged$.subscribe(direction => {
            if (direction === 1) {
                this.slider.slideNext();
            }
            else if (direction === -1) {
                this.slider.slidePrev();
            }
        });
        this.slideUpdatedSubscription = this.calendarService.slideUpdated$.subscribe(() => {
            this.slider.update();
        });
    }
    ngOnDestroy() {
        if (this.currentDateChangedFromParentSubscription) {
            this.currentDateChangedFromParentSubscription.unsubscribe();
            this.currentDateChangedFromParentSubscription = undefined;
        }
        if (this.eventSourceChangedSubscription) {
            this.eventSourceChangedSubscription.unsubscribe();
            this.eventSourceChangedSubscription = undefined;
        }
        if (this.slideChangedSubscription) {
            this.slideChangedSubscription.unsubscribe();
            this.slideChangedSubscription = undefined;
        }
        if (this.slideUpdatedSubscription) {
            this.slideUpdatedSubscription.unsubscribe();
            this.slideUpdatedSubscription = undefined;
        }
    }
    ngOnChanges(changes) {
        if (!this.inited) {
            return;
        }
        const eventSourceChange = changes['eventSource'];
        if (eventSourceChange && eventSourceChange.currentValue) {
            this.onDataLoaded();
        }
        const lockSwipeToPrev = changes['lockSwipeToPrev'];
        if (lockSwipeToPrev) {
            this.slider.allowSlidePrev = !lockSwipeToPrev.currentValue;
        }
        const lockSwipeToNext = changes['lockSwipeToNext'];
        if (lockSwipeToNext) {
            this.slider.allowSlideNext = !lockSwipeToNext.currentValue;
        }
        const lockSwipes = changes['lockSwipes'];
        if (lockSwipes) {
            this.slider.allowTouchMove = !lockSwipes.currentValue;
        }
    }
    ngAfterViewInit() {
        this.slider = new Swiper(this.swiperElement?.nativeElement, this.sliderOptions);
        let me = this;
        this.slider.on('slideNextTransitionEnd', function () {
            me.onSlideChanged(1);
        });
        this.slider.on('slidePrevTransitionEnd', function () {
            me.onSlideChanged(-1);
        });
        if (this.dir == 'rtl') {
            this.slider.changeLanguageDirection('rtl');
        }
        const title = this.getTitle();
        this.onTitleChanged.emit(title);
    }
    setSwiperInstance(swiper) {
        this.slider = swiper;
    }
    onSlideChanged(direction) {
        this.currentViewIndex = (this.currentViewIndex + direction + 3) % 3;
        this.move(direction);
    }
    move(direction) {
        if (direction === 0) {
            return;
        }
        this.direction = direction;
        if (!this.moveOnSelected) {
            const adjacentDate = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
            this.calendarService.setCurrentDate(adjacentDate);
        }
        this.refreshView();
        this.direction = 0;
        this.moveOnSelected = false;
    }
    createDateObject(date) {
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(date);
        }
        return {
            date,
            events: [],
            label: this.formatDayLabel(date),
            secondary: false,
            disabled
        };
    }
    getViewData(startTime) {
        const startDate = startTime, date = startDate.getDate(), month = (startDate.getMonth() + (date !== 1 ? 1 : 0)) % 12;
        const dates = MonthViewComponent.getDates(startDate, 42);
        const days = [];
        for (let i = 0; i < 42; i++) {
            const dateObject = this.createDateObject(dates[i]);
            dateObject.secondary = dates[i].getMonth() !== month;
            days[i] = dateObject;
        }
        const dayHeaders = [];
        for (let i = 0; i < 7; i++) {
            dayHeaders.push(this.formatDayHeaderLabel(days[i].date));
        }
        return {
            dates: days,
            dayHeaders
        };
    }
    getHighlightClass(date) {
        let className = '';
        if (date.hasEvent) {
            if (date.secondary) {
                className = 'monthview-secondary-with-event';
            }
            else {
                className = 'monthview-primary-with-event';
            }
        }
        if (date.selected) {
            if (className) {
                className += ' ';
            }
            className += 'monthview-selected';
        }
        if (date.current) {
            if (className) {
                className += ' ';
            }
            className += 'monthview-current';
        }
        if (date.secondary) {
            if (className) {
                className += ' ';
            }
            className += 'text-muted';
        }
        if (date.disabled) {
            if (className) {
                className += ' ';
            }
            className += 'monthview-disabled';
        }
        return className;
    }
    getRange(currentDate) {
        const year = currentDate.getFullYear(), month = currentDate.getMonth(), firstDayOfMonth = new Date(year, month, 1, 12, 0, 0), // set hour to 12 to avoid DST problem
        difference = this.startingDayMonth - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference, startDate = new Date(firstDayOfMonth.getTime());
        if (numDisplayedFromPreviousMonth > 0) {
            startDate.setDate(-numDisplayedFromPreviousMonth + 1);
        }
        const endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + 42);
        return {
            startTime: startDate,
            endTime: endDate
        };
    }
    onDataLoaded() {
        const range = this.range, eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = range.startTime, endTime = range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, dates = this.views[currentViewIndex].dates, oneDay = 86400000, eps = 0.0006;
        for (let r = 0; r < 42; r += 1) {
            if (dates[r].hasEvent) {
                dates[r].hasEvent = false;
                dates[r].events = [];
            }
        }
        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i], eventStartTime = event.startTime, eventEndTime = event.endTime;
            let eventUTCStartTime, eventUTCEndTime;
            if (event.allDay) {
                eventUTCStartTime = eventStartTime.getTime();
                eventUTCEndTime = eventEndTime.getTime();
            }
            else {
                eventUTCStartTime = Date.UTC(eventStartTime.getFullYear(), eventStartTime.getMonth(), eventStartTime.getDate());
                eventUTCEndTime = Date.UTC(eventEndTime.getFullYear(), eventEndTime.getMonth(), eventEndTime.getDate() + 1);
            }
            if (eventUTCEndTime <= utcStartTime || eventUTCStartTime >= utcEndTime) {
                continue;
            }
            let timeDifferenceStart, timeDifferenceEnd;
            if (eventUTCStartTime < utcStartTime) {
                timeDifferenceStart = 0;
            }
            else {
                timeDifferenceStart = (eventUTCStartTime - utcStartTime) / oneDay;
            }
            if (eventUTCEndTime > utcEndTime) {
                timeDifferenceEnd = (utcEndTime - utcStartTime) / oneDay;
            }
            else {
                timeDifferenceEnd = (eventUTCEndTime - utcStartTime) / oneDay;
            }
            let index = Math.floor(timeDifferenceStart);
            const endIndex = Math.ceil(timeDifferenceEnd - eps);
            while (index < endIndex) {
                dates[index].hasEvent = true;
                let eventSet = dates[index].events;
                if (eventSet) {
                    eventSet.push(event);
                }
                else {
                    eventSet = [];
                    eventSet.push(event);
                    dates[index].events = eventSet;
                }
                index += 1;
            }
        }
        for (let r = 0; r < 42; r += 1) {
            if (dates[r].hasEvent) {
                dates[r].events.sort(this.compareEvent);
            }
        }
        if (this.autoSelect) {
            let findSelected = false;
            for (let r = 0; r < 42; r += 1) {
                if (dates[r].selected) {
                    this.selectedDate = dates[r];
                    findSelected = true;
                    break;
                }
            }
            if (findSelected && this.selectedDate) {
                this.onTimeSelected.emit({
                    selectedTime: this.selectedDate.date,
                    events: this.selectedDate.events,
                    disabled: this.selectedDate.disabled
                });
            }
        }
    }
    refreshView() {
        this.range = this.getRange(this.calendarService.currentDate);
        if (this.inited) {
            const title = this.getTitle();
            this.onTitleChanged.emit(title);
        }
        this.calendarService.populateAdjacentViews(this);
        this.updateCurrentView(this.range.startTime, this.views[this.currentViewIndex]);
        this.calendarService.rangeChanged(this);
    }
    getTitle() {
        const currentViewStartDate = this.range.startTime, date = currentViewStartDate.getDate(), month = (currentViewStartDate.getMonth() + (date !== 1 ? 1 : 0)) % 12, year = currentViewStartDate.getFullYear() + (date !== 1 && month === 0 ? 1 : 0), headerDate = new Date(year, month, 1, 12, 0, 0, 0);
        return this.formatTitle(headerDate);
    }
    compareEvent(event1, event2) {
        if (event1.allDay) {
            return 1;
        }
        else if (event2.allDay) {
            return -1;
        }
        else {
            return (event1.startTime.getTime() - event2.startTime.getTime());
        }
    }
    select(viewDate) {
        if (!this.views) {
            return;
        }
        const selectedDate = viewDate.date, events = viewDate.events;
        if (!viewDate.disabled) {
            const dates = this.views[this.currentViewIndex].dates, currentCalendarDate = this.calendarService.currentDate, currentMonth = currentCalendarDate.getMonth(), currentYear = currentCalendarDate.getFullYear(), selectedMonth = selectedDate.getMonth(), selectedYear = selectedDate.getFullYear();
            let direction = 0;
            if (currentYear === selectedYear) {
                if (currentMonth !== selectedMonth) {
                    direction = currentMonth < selectedMonth ? 1 : -1;
                }
            }
            else {
                direction = currentYear < selectedYear ? 1 : -1;
            }
            this.calendarService.setCurrentDate(selectedDate);
            if (direction === 0) {
                const currentViewStartDate = this.range.startTime, oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
                for (let r = 0; r < 42; r += 1) {
                    dates[r].selected = false;
                }
                if (selectedDayDifference >= 0 && selectedDayDifference < 42) {
                    dates[selectedDayDifference].selected = true;
                    this.selectedDate = dates[selectedDayDifference];
                }
            }
            else {
                this.moveOnSelected = true;
                this.slideView(direction);
            }
        }
        this.onTimeSelected.emit({ selectedTime: selectedDate, events, disabled: viewDate.disabled });
    }
    slideView(direction) {
        if (direction === 1) {
            this.slider.slideNext();
        }
        else if (direction === -1) {
            this.slider.slidePrev();
        }
    }
    updateCurrentView(currentViewStartDate, view) {
        const currentCalendarDate = this.calendarService.currentDate, today = new Date(), oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay), currentDayDifference = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        for (let r = 0; r < 42; r += 1) {
            view.dates[r].selected = false;
        }
        if (selectedDayDifference >= 0 && selectedDayDifference < 42 && !view.dates[selectedDayDifference].disabled && (this.autoSelect || this.moveOnSelected)) {
            view.dates[selectedDayDifference].selected = true;
            this.selectedDate = view.dates[selectedDayDifference];
        }
        else {
            this.selectedDate = undefined;
        }
        if (currentDayDifference >= 0 && currentDayDifference < 42) {
            view.dates[currentDayDifference].current = true;
        }
    }
    eventSelected(event) {
        this.onEventSelected.emit(event);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: MonthViewComponent, deps: [{ token: CalendarService }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: MonthViewComponent, isStandalone: false, selector: "monthview", inputs: { monthviewDisplayEventTemplate: "monthviewDisplayEventTemplate", monthviewInactiveDisplayEventTemplate: "monthviewInactiveDisplayEventTemplate", monthviewEventDetailTemplate: "monthviewEventDetailTemplate", formatDay: "formatDay", formatDayHeader: "formatDayHeader", formatMonthTitle: "formatMonthTitle", eventSource: "eventSource", startingDayMonth: "startingDayMonth", showEventDetail: "showEventDetail", noEventsLabel: "noEventsLabel", autoSelect: "autoSelect", markDisabled: "markDisabled", locale: "locale", dateFormatter: "dateFormatter", dir: "dir", lockSwipeToPrev: "lockSwipeToPrev", lockSwipeToNext: "lockSwipeToNext", lockSwipes: "lockSwipes", sliderOptions: "sliderOptions" }, outputs: { onRangeChanged: "onRangeChanged", onEventSelected: "onEventSelected", onTimeSelected: "onTimeSelected", onTitleChanged: "onTitleChanged" }, viewQueries: [{ propertyName: "swiperElement", first: true, predicate: ["monthViewSwiper"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"swiper monthview-swiper\" #monthViewSwiper>\r\n    <div class=\"swiper-wrapper\">\r\n        <div class=\"swiper-slide\">\r\n            <table *ngIf=\"0===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr>\r\n                        <th *ngFor=\"let dayHeader of views[0].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[0].dates[row*7+col])\"\r\n                            [ngClass]=\"getHighlightClass(views[0].dates[row*7+col])\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[0], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    </tr>\r\n                </tbody>\r\n            </table>\r\n            <table *ngIf=\"0!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr class=\"text-center\">\r\n                        <th *ngFor=\"let dayHeader of views[0].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[0], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    <tr>\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n        <div class=\"swiper-slide\">\r\n            <table *ngIf=\"1===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr>\r\n                        <th *ngFor=\"let dayHeader of views[1].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[1].dates[row*7+col])\"\r\n                            [ngClass]=\"getHighlightClass(views[1].dates[row*7+col])\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[1], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    </tr>\r\n                </tbody>\r\n            </table>\r\n            <table *ngIf=\"1!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr class=\"text-center\">\r\n                        <th *ngFor=\"let dayHeader of views[1].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[1], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    <tr>\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n        <div class=\"swiper-slide\">\r\n            <table *ngIf=\"2===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr>\r\n                        <th *ngFor=\"let dayHeader of views[2].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[2].dates[row*7+col])\"\r\n                            [ngClass]=\"getHighlightClass(views[2].dates[row*7+col])\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[2], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    </tr>\r\n                </tbody>\r\n            </table>\r\n            <table *ngIf=\"2!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr class=\"text-center\">\r\n                        <th *ngFor=\"let dayHeader of views[2].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[2], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    <tr>\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n    </div>\r\n    <ng-template [ngTemplateOutlet]=\"monthviewEventDetailTemplate\"\r\n        [ngTemplateOutletContext]=\"{showEventDetail:showEventDetail, selectedDate: selectedDate, noEventsLabel: noEventsLabel}\">\r\n    </ng-template>\r\n</div>", styles: [".text-muted{color:#999}.table-fixed{table-layout:fixed}.table{width:100%;max-width:100%;background-color:transparent}.table>thead>tr>th,.table>tbody>tr>th,.table>tfoot>tr>th,.table>thead>tr>td,.table>tbody>tr>td,.table>tfoot>tr>td{padding:8px;line-height:20px;vertical-align:top}.table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}.table>thead:first-child>tr:first-child>th,.table>thead:first-child>tr:first-child>td{border-top:0}.table>tbody+tbody{border-top:2px solid #ddd}.table-bordered{border:1px solid #ddd}.table-bordered>thead>tr>th,.table-bordered>tbody>tr>th,.table-bordered>tfoot>tr>th,.table-bordered>thead>tr>td,.table-bordered>tbody>tr>td,.table-bordered>tfoot>tr>td{border:1px solid #ddd}.table-bordered>thead>tr>th,.table-bordered>thead>tr>td{border-bottom-width:2px}.table-striped>tbody>tr:nth-child(odd)>td,.table-striped>tbody>tr:nth-child(odd)>th{background-color:#f9f9f9}.monthview-primary-with-event{background-color:#3a87ad;color:#fff}.monthview-current{background-color:#f0f0f0}.monthview-selected{background-color:#090;color:#fff}.monthview-datetable td.monthview-disabled{color:#d3d3d3;cursor:default}.monthview-datetable th{text-align:center}.monthview-datetable td{cursor:pointer;text-align:center}.monthview-secondary-with-event{background-color:#d9edf7}::-webkit-scrollbar,*::-webkit-scrollbar{display:none}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: MonthViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'monthview', standalone: false, template: "<div class=\"swiper monthview-swiper\" #monthViewSwiper>\r\n    <div class=\"swiper-wrapper\">\r\n        <div class=\"swiper-slide\">\r\n            <table *ngIf=\"0===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr>\r\n                        <th *ngFor=\"let dayHeader of views[0].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[0].dates[row*7+col])\"\r\n                            [ngClass]=\"getHighlightClass(views[0].dates[row*7+col])\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[0], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    </tr>\r\n                </tbody>\r\n            </table>\r\n            <table *ngIf=\"0!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr class=\"text-center\">\r\n                        <th *ngFor=\"let dayHeader of views[0].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[0], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    <tr>\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n        <div class=\"swiper-slide\">\r\n            <table *ngIf=\"1===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr>\r\n                        <th *ngFor=\"let dayHeader of views[1].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[1].dates[row*7+col])\"\r\n                            [ngClass]=\"getHighlightClass(views[1].dates[row*7+col])\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[1], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    </tr>\r\n                </tbody>\r\n            </table>\r\n            <table *ngIf=\"1!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr class=\"text-center\">\r\n                        <th *ngFor=\"let dayHeader of views[1].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[1], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    <tr>\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n        <div class=\"swiper-slide\">\r\n            <table *ngIf=\"2===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr>\r\n                        <th *ngFor=\"let dayHeader of views[2].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[2].dates[row*7+col])\"\r\n                            [ngClass]=\"getHighlightClass(views[2].dates[row*7+col])\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[2], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    </tr>\r\n                </tbody>\r\n            </table>\r\n            <table *ngIf=\"2!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\r\n                <thead>\r\n                    <tr class=\"text-center\">\r\n                        <th *ngFor=\"let dayHeader of views[2].dayHeaders\">\r\n                            <small>{{dayHeader}}</small>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\r\n                        <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\r\n                            <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\r\n                                [ngTemplateOutletContext]=\"{view: views[2], row: row, col: col}\">\r\n                            </ng-template>\r\n                        </td>\r\n                    <tr>\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n    </div>\r\n    <ng-template [ngTemplateOutlet]=\"monthviewEventDetailTemplate\"\r\n        [ngTemplateOutletContext]=\"{showEventDetail:showEventDetail, selectedDate: selectedDate, noEventsLabel: noEventsLabel}\">\r\n    </ng-template>\r\n</div>", styles: [".text-muted{color:#999}.table-fixed{table-layout:fixed}.table{width:100%;max-width:100%;background-color:transparent}.table>thead>tr>th,.table>tbody>tr>th,.table>tfoot>tr>th,.table>thead>tr>td,.table>tbody>tr>td,.table>tfoot>tr>td{padding:8px;line-height:20px;vertical-align:top}.table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}.table>thead:first-child>tr:first-child>th,.table>thead:first-child>tr:first-child>td{border-top:0}.table>tbody+tbody{border-top:2px solid #ddd}.table-bordered{border:1px solid #ddd}.table-bordered>thead>tr>th,.table-bordered>tbody>tr>th,.table-bordered>tfoot>tr>th,.table-bordered>thead>tr>td,.table-bordered>tbody>tr>td,.table-bordered>tfoot>tr>td{border:1px solid #ddd}.table-bordered>thead>tr>th,.table-bordered>thead>tr>td{border-bottom-width:2px}.table-striped>tbody>tr:nth-child(odd)>td,.table-striped>tbody>tr:nth-child(odd)>th{background-color:#f9f9f9}.monthview-primary-with-event{background-color:#3a87ad;color:#fff}.monthview-current{background-color:#f0f0f0}.monthview-selected{background-color:#090;color:#fff}.monthview-datetable td.monthview-disabled{color:#d3d3d3;cursor:default}.monthview-datetable th{text-align:center}.monthview-datetable td{cursor:pointer;text-align:center}.monthview-secondary-with-event{background-color:#d9edf7}::-webkit-scrollbar,*::-webkit-scrollbar{display:none}\n"] }]
        }], ctorParameters: () => [{ type: CalendarService }, { type: i0.NgZone }], propDecorators: { swiperElement: [{
                type: ViewChild,
                args: ['monthViewSwiper']
            }], monthviewDisplayEventTemplate: [{
                type: Input
            }], monthviewInactiveDisplayEventTemplate: [{
                type: Input
            }], monthviewEventDetailTemplate: [{
                type: Input
            }], formatDay: [{
                type: Input
            }], formatDayHeader: [{
                type: Input
            }], formatMonthTitle: [{
                type: Input
            }], eventSource: [{
                type: Input
            }], startingDayMonth: [{
                type: Input
            }], showEventDetail: [{
                type: Input
            }], noEventsLabel: [{
                type: Input
            }], autoSelect: [{
                type: Input
            }], markDisabled: [{
                type: Input
            }], locale: [{
                type: Input
            }], dateFormatter: [{
                type: Input
            }], dir: [{
                type: Input
            }], lockSwipeToPrev: [{
                type: Input
            }], lockSwipeToNext: [{
                type: Input
            }], lockSwipes: [{
                type: Input
            }], sliderOptions: [{
                type: Input
            }], onRangeChanged: [{
                type: Output
            }], onEventSelected: [{
                type: Output
            }], onTimeSelected: [{
                type: Output
            }], onTitleChanged: [{
                type: Output
            }] } });

class initPositionScrollComponent {
    constructor(el, ngZone) {
        this.ngZone = ngZone;
        this.onScroll = new EventEmitter();
        this.listenerAttached = false;
        this.element = el;
    }
    ngOnChanges(changes) {
        let initPosition = changes['initPosition'];
        if (initPosition && initPosition.currentValue !== undefined && this.scrollContent && initPosition.currentValue != this.scrollContent.scrollTop) {
            const me = this;
            this.ngZone.run(() => {
                me.scrollContent.scrollTop = initPosition.currentValue;
            });
        }
    }
    ngAfterViewInit() {
        const scrollContent = this.scrollContent = this.element.nativeElement.querySelector('.scroll-content');
        if (this.initPosition !== undefined) {
            scrollContent.scrollTop = this.initPosition;
        }
        if (this.emitEvent && !this.listenerAttached) {
            let onScroll = this.onScroll;
            let me = this;
            this.handler = function () {
                if (me.initPosition != scrollContent.scrollTop) {
                    onScroll.emit(scrollContent.scrollTop);
                }
            };
            this.listenerAttached = true;
            scrollContent.addEventListener('scroll', this.handler);
        }
    }
    ngOnDestroy() {
        if (this.listenerAttached) {
            this.scrollContent.removeEventListener('scroll', this.handler);
            this.listenerAttached = false;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: initPositionScrollComponent, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: initPositionScrollComponent, isStandalone: false, selector: "init-position-scroll", inputs: { initPosition: "initPosition", emitEvent: "emitEvent" }, outputs: { onScroll: "onScroll" }, usesOnChanges: true, ngImport: i0, template: `
        <div class="scroll-content" style="height:100%">
            <ng-content></ng-content>
        </div>
    `, isInline: true, styles: [".scroll-content{overflow-y:auto;overflow-x:hidden}\n"], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: initPositionScrollComponent, decorators: [{
            type: Component,
            args: [{ selector: 'init-position-scroll', template: `
        <div class="scroll-content" style="height:100%">
            <ng-content></ng-content>
        </div>
    `, encapsulation: ViewEncapsulation.None, standalone: false, styles: [".scroll-content{overflow-y:auto;overflow-x:hidden}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { initPosition: [{
                type: Input
            }], emitEvent: [{
                type: Input
            }], onScroll: [{
                type: Output
            }] } });

class WeekViewComponent {
    constructor(calendarService, elm, zone) {
        this.calendarService = calendarService;
        this.elm = elm;
        this.zone = zone;
        this.class = true;
        this.autoSelect = true;
        this.dir = '';
        this.scrollToHour = 0;
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onDayHeaderSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter();
        this.sliderIndexList = [0, 1, 2];
        this.views = [];
        this.currentViewIndex = 0;
        this.direction = 0;
        this.mode = 'week';
        this.inited = false;
    }
    static createDateObjects(startTime, startHour, endHour, timeInterval) {
        const times = [], currentHour = 0, currentDate = startTime.getDate();
        let hourStep, minStep;
        if (timeInterval < 1) {
            hourStep = Math.floor(1 / timeInterval);
            minStep = 60;
        }
        else {
            hourStep = 1;
            minStep = Math.floor(60 / timeInterval);
        }
        for (let hour = startHour; hour < endHour; hour += hourStep) {
            for (let interval = 0; interval < 60; interval += minStep) {
                const row = [];
                for (let day = 0; day < 7; day += 1) {
                    const time = new Date(startTime.getTime());
                    time.setHours(currentHour + hour, interval);
                    time.setDate(currentDate + day);
                    row.push({
                        events: [],
                        time
                    });
                }
                times.push(row);
            }
        }
        return times;
    }
    static getDates(startTime, n) {
        const dates = new Array(n), current = new Date(startTime.getTime());
        let i = 0;
        while (i < n) {
            dates[i++] = {
                date: new Date(current.getTime()),
                events: [],
                dayHeader: ''
            };
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
    static compareEventByStartOffset(eventA, eventB) {
        return eventA.startOffset - eventB.startOffset;
    }
    static calculateWidth(orderedEvents, size, hourParts) {
        const totalSize = size * hourParts, cells = new Array(totalSize);
        // sort by position in descending order, the right most columns should be calculated first
        orderedEvents.sort((eventA, eventB) => {
            return eventB.position - eventA.position;
        });
        for (let i = 0; i < totalSize; i += 1) {
            cells[i] = {
                calculated: false,
                events: []
            };
        }
        const len = orderedEvents.length;
        for (let i = 0; i < len; i += 1) {
            const event = orderedEvents[i];
            let index = event.startIndex * hourParts + event.startOffset;
            while (index < event.endIndex * hourParts - event.endOffset) {
                cells[index].events.push(event);
                index += 1;
            }
        }
        let i = 0;
        while (i < len) {
            let event = orderedEvents[i];
            if (!event.overlapNumber) {
                const overlapNumber = event.position + 1;
                event.overlapNumber = overlapNumber;
                const eventQueue = [event];
                while (event = eventQueue.shift()) {
                    let index = event.startIndex * hourParts + event.startOffset;
                    while (index < event.endIndex * hourParts - event.endOffset) {
                        if (!cells[index].calculated) {
                            cells[index].calculated = true;
                            if (cells[index].events) {
                                const eventCountInCell = cells[index].events.length;
                                for (let j = 0; j < eventCountInCell; j += 1) {
                                    const currentEventInCell = cells[index].events[j];
                                    if (!currentEventInCell.overlapNumber) {
                                        currentEventInCell.overlapNumber = overlapNumber;
                                        eventQueue.push(currentEventInCell);
                                    }
                                }
                            }
                        }
                        index += 1;
                    }
                }
            }
            i += 1;
        }
    }
    ngOnInit() {
        if (!this.sliderOptions) {
            this.sliderOptions = {};
        }
        this.sliderOptions.loop = true;
        this.sliderOptions.allowSlidePrev = !this.lockSwipeToPrev;
        this.sliderOptions.allowSlideNext = !this.lockSwipeToNext;
        this.sliderOptions.allowTouchMove = !this.lockSwipes;
        this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
        if (this.dateFormatter && this.dateFormatter.formatWeekViewDayHeader) {
            this.formatDayHeader = this.dateFormatter.formatWeekViewDayHeader;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatDayHeader = function (date) {
                return datePipe.transform(date, this.formatWeekViewDayHeader) || '';
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatWeekViewTitle) {
            this.formatTitle = this.dateFormatter.formatWeekViewTitle;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe.transform(date, this.formatWeekTitle) || '';
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatWeekViewHourColumn) {
            this.formatHourColumnLabel = this.dateFormatter.formatWeekViewHourColumn;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatHourColumnLabel = function (date) {
                return datePipe.transform(date, this.formatHourColumn) || '';
            };
        }
        this.refreshView();
        this.hourColumnLabels = this.getHourColumnLabels();
        this.inited = true;
        this.currentDateChangedFromParentSubscription = this.calendarService.currentDateChangedFromParent$.subscribe(currentDate => {
            this.refreshView();
        });
        this.eventSourceChangedSubscription = this.calendarService.eventSourceChanged$.subscribe(() => {
            this.onDataLoaded();
        });
        this.slideChangedSubscription = this.calendarService.slideChanged$.subscribe(direction => {
            if (direction === 1) {
                this.slider.slideNext();
            }
            else if (direction === -1) {
                this.slider.slidePrev();
            }
        });
        this.slideUpdatedSubscription = this.calendarService.slideUpdated$.subscribe(() => {
            this.slider.update();
        });
    }
    ngAfterViewInit() {
        this.slider = new Swiper(this.swiperElement?.nativeElement, this.sliderOptions);
        let me = this;
        this.slider.on('slideNextTransitionEnd', function () {
            me.onSlideChanged(1);
        });
        this.slider.on('slidePrevTransitionEnd', function () {
            me.onSlideChanged(-1);
        });
        if (this.dir === 'rtl') {
            this.slider.changeLanguageDirection('rtl');
        }
        const title = this.getTitle();
        this.onTitleChanged.emit(title);
        if (this.scrollToHour > 0) {
            const hourColumns = this.elm.nativeElement.querySelector('.weekview-normal-event-container').querySelectorAll('.calendar-hour-column');
            const me = this;
            setTimeout(() => {
                me.initScrollPosition = hourColumns[me.scrollToHour - me.startHour].offsetTop;
            }, 50);
        }
    }
    ngOnChanges(changes) {
        if (!this.inited) {
            return;
        }
        if ((changes['startHour'] || changes['endHour']) && (!changes['startHour'].isFirstChange() || !changes['endHour'].isFirstChange())) {
            this.views = [];
            this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
            this.direction = 0;
            this.refreshView();
            this.hourColumnLabels = this.getHourColumnLabels();
        }
        const eventSourceChange = changes['eventSource'];
        if (eventSourceChange && eventSourceChange.currentValue) {
            this.onDataLoaded();
        }
        const lockSwipeToPrev = changes['lockSwipeToPrev'];
        if (lockSwipeToPrev) {
            this.slider.allowSlidePrev = !lockSwipeToPrev.currentValue;
        }
        const lockSwipeToNext = changes['lockSwipeToNext'];
        if (lockSwipeToPrev) {
            this.slider.allowSlideNext = !lockSwipeToNext.currentValue;
        }
        const lockSwipes = changes['lockSwipes'];
        if (lockSwipes) {
            this.slider.allowTouchMove = !lockSwipes.currentValue;
        }
    }
    ngOnDestroy() {
        if (this.currentDateChangedFromParentSubscription) {
            this.currentDateChangedFromParentSubscription.unsubscribe();
            this.currentDateChangedFromParentSubscription = undefined;
        }
        if (this.eventSourceChangedSubscription) {
            this.eventSourceChangedSubscription.unsubscribe();
            this.eventSourceChangedSubscription = undefined;
        }
        if (this.slideChangedSubscription) {
            this.slideChangedSubscription.unsubscribe();
            this.slideChangedSubscription = undefined;
        }
        if (this.slideUpdatedSubscription) {
            this.slideUpdatedSubscription.unsubscribe();
            this.slideUpdatedSubscription = undefined;
        }
    }
    onSlideChanged(direction) {
        this.currentViewIndex = (this.currentViewIndex + direction + 3) % 3;
        this.move(direction);
    }
    move(direction) {
        if (direction === 0) {
            return;
        }
        this.direction = direction;
        const adjacent = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
        this.calendarService.setCurrentDate(adjacent);
        this.refreshView();
        this.direction = 0;
    }
    getHourColumnLabels() {
        const hourColumnLabels = [];
        for (let hour = 0, length = this.views[0].rows.length; hour < length; hour += 1) {
            // handle edge case for DST
            if (hour === 0 && this.views[0].rows[hour][0].time.getHours() !== this.startHour) {
                const time = new Date(this.views[0].rows[hour][0].time);
                time.setDate(time.getDate() + 1);
                time.setHours(this.startHour);
                hourColumnLabels.push(this.formatHourColumnLabel(time));
            }
            else {
                hourColumnLabels.push(this.formatHourColumnLabel(this.views[0].rows[hour][0].time));
            }
        }
        return hourColumnLabels;
    }
    getViewData(startTime) {
        const dates = WeekViewComponent.getDates(startTime, 7);
        for (let i = 0; i < 7; i++) {
            dates[i].dayHeader = this.formatDayHeader(dates[i].date);
        }
        return {
            rows: WeekViewComponent.createDateObjects(startTime, this.startHour, this.endHour, this.hourSegments),
            dates
        };
    }
    getRange(currentDate) {
        const year = currentDate.getFullYear(), month = currentDate.getMonth(), date = currentDate.getDate(), day = currentDate.getDay();
        let difference = day - this.startingDayWeek;
        if (difference < 0) {
            difference += 7;
        }
        // set hour to 12 to avoid DST problem
        const firstDayOfWeek = new Date(year, month, date - difference, 12, 0, 0), endTime = new Date(year, month, date - difference + 7, 12, 0, 0);
        return {
            startTime: firstDayOfWeek,
            endTime
        };
    }
    onDataLoaded() {
        const eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = this.range.startTime, endTime = this.range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, rows = this.views[currentViewIndex].rows, dates = this.views[currentViewIndex].dates, oneHour = 3600000, oneDay = 86400000, 
        // add allday eps
        eps = 0.016, rangeStartRowIndex = this.startHour * this.hourSegments, rangeEndRowIndex = this.endHour * this.hourSegments, allRows = 24 * this.hourSegments;
        let allDayEventInRange = false, normalEventInRange = false;
        for (let i = 0; i < 7; i += 1) {
            dates[i].events = [];
            dates[i].hasEvent = false;
        }
        for (let day = 0; day < 7; day += 1) {
            for (let hour = 0; hour < this.hourRange; hour += 1) {
                rows[hour][day].events = [];
            }
        }
        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i];
            const eventStartTime = event.startTime;
            const eventEndTime = event.endTime;
            let eventUTCStartTime, eventUTCEndTime;
            if (event.allDay) {
                eventUTCStartTime = eventStartTime.getTime();
                eventUTCEndTime = eventEndTime.getTime();
            }
            else {
                eventUTCStartTime = Date.UTC(eventStartTime.getFullYear(), eventStartTime.getMonth(), eventStartTime.getDate());
                eventUTCEndTime = Date.UTC(eventEndTime.getFullYear(), eventEndTime.getMonth(), eventEndTime.getDate() + 1);
            }
            if (eventUTCEndTime <= utcStartTime || eventUTCStartTime >= utcEndTime || eventStartTime >= eventEndTime) {
                continue;
            }
            if (event.allDay) {
                allDayEventInRange = true;
                let allDayStartIndex;
                if (eventUTCStartTime <= utcStartTime) {
                    allDayStartIndex = 0;
                }
                else {
                    allDayStartIndex = Math.round((eventUTCStartTime - utcStartTime) / oneDay);
                }
                let allDayEndIndex;
                if (eventUTCEndTime >= utcEndTime) {
                    allDayEndIndex = Math.round((utcEndTime - utcStartTime) / oneDay);
                }
                else {
                    allDayEndIndex = Math.round((eventUTCEndTime - utcStartTime) / oneDay);
                }
                const displayAllDayEvent = {
                    event,
                    startIndex: allDayStartIndex,
                    endIndex: allDayEndIndex,
                    startOffset: 0,
                    endOffset: 0,
                    position: 0
                };
                let eventSet = dates[allDayStartIndex].events;
                if (eventSet) {
                    eventSet.push(displayAllDayEvent);
                }
                else {
                    eventSet = [];
                    eventSet.push(displayAllDayEvent);
                    dates[allDayStartIndex].events = eventSet;
                }
                dates[allDayStartIndex].hasEvent = true;
            }
            else {
                normalEventInRange = true;
                let timeDifferenceStart;
                if (eventUTCStartTime < utcStartTime) {
                    timeDifferenceStart = 0;
                }
                else {
                    timeDifferenceStart = (eventUTCStartTime - utcStartTime) / oneHour * this.hourSegments + (eventStartTime.getHours() + eventStartTime.getMinutes() / 60) * this.hourSegments;
                }
                let timeDifferenceEnd;
                if (eventUTCEndTime > utcEndTime) {
                    timeDifferenceEnd = (utcEndTime - utcStartTime) / oneHour * this.hourSegments;
                }
                else {
                    timeDifferenceEnd = (eventUTCEndTime - oneDay - utcStartTime) / oneHour * this.hourSegments + (eventEndTime.getHours() + eventEndTime.getMinutes() / 60) * this.hourSegments;
                }
                const startIndex = Math.floor(timeDifferenceStart), endIndex = Math.ceil(timeDifferenceEnd - eps);
                let startRowIndex = startIndex % allRows, dayIndex = Math.floor(startIndex / allRows), endOfDay = dayIndex * allRows, startOffset = 0, endOffset = 0;
                if (this.hourParts !== 1) {
                    if (startRowIndex < rangeStartRowIndex) {
                        startOffset = 0;
                    }
                    else {
                        startOffset = Math.floor((timeDifferenceStart - startIndex) * this.hourParts);
                    }
                }
                do {
                    endOfDay += allRows;
                    let endRowIndex;
                    if (endOfDay < endIndex) {
                        endRowIndex = allRows;
                    }
                    else {
                        if (endOfDay === endIndex) {
                            endRowIndex = allRows;
                        }
                        else {
                            endRowIndex = endIndex % allRows;
                        }
                        if (this.hourParts !== 1) {
                            if (endRowIndex > rangeEndRowIndex) {
                                endOffset = 0;
                            }
                            else {
                                endOffset = Math.floor((endIndex - timeDifferenceEnd) * this.hourParts);
                            }
                        }
                    }
                    if (startRowIndex < rangeStartRowIndex) {
                        startRowIndex = 0;
                    }
                    else {
                        startRowIndex -= rangeStartRowIndex;
                    }
                    if (endRowIndex > rangeEndRowIndex) {
                        endRowIndex = rangeEndRowIndex;
                    }
                    endRowIndex -= rangeStartRowIndex;
                    if (startRowIndex < endRowIndex) {
                        const displayEvent = {
                            event,
                            startIndex: startRowIndex,
                            endIndex: endRowIndex,
                            startOffset,
                            endOffset,
                            position: 0
                        };
                        let eventSet = rows[startRowIndex][dayIndex].events;
                        if (eventSet) {
                            eventSet.push(displayEvent);
                        }
                        else {
                            eventSet = [];
                            eventSet.push(displayEvent);
                            rows[startRowIndex][dayIndex].events = eventSet;
                        }
                        dates[dayIndex].hasEvent = true;
                    }
                    startRowIndex = 0;
                    startOffset = 0;
                    dayIndex += 1;
                } while (endOfDay < endIndex);
            }
        }
        if (normalEventInRange) {
            for (let day = 0; day < 7; day += 1) {
                let orderedEvents = [];
                for (let hour = 0; hour < this.hourRange; hour += 1) {
                    if (rows[hour][day].events) {
                        rows[hour][day].events.sort(WeekViewComponent.compareEventByStartOffset);
                        orderedEvents = orderedEvents.concat(rows[hour][day].events);
                    }
                }
                if (orderedEvents.length > 0) {
                    this.placeEvents(orderedEvents);
                }
            }
        }
        if (allDayEventInRange) {
            let orderedAllDayEvents = [];
            for (let day = 0; day < 7; day += 1) {
                if (dates[day].events) {
                    orderedAllDayEvents = orderedAllDayEvents.concat(dates[day].events);
                }
            }
            if (orderedAllDayEvents.length > 0) {
                this.placeAllDayEvents(orderedAllDayEvents);
            }
        }
        if (this.autoSelect) {
            let selectedDate;
            for (let r = 0; r < 7; r += 1) {
                if (dates[r].selected) {
                    selectedDate = dates[r];
                    break;
                }
            }
            if (selectedDate) {
                let disabled = false;
                if (this.markDisabled) {
                    disabled = this.markDisabled(selectedDate.date);
                }
                this.onTimeSelected.emit({
                    selectedTime: selectedDate.date,
                    events: selectedDate.events.map(e => e.event),
                    disabled
                });
            }
        }
    }
    refreshView() {
        this.range = this.getRange(this.calendarService.currentDate);
        if (this.inited) {
            const title = this.getTitle();
            this.onTitleChanged.emit(title);
        }
        this.calendarService.populateAdjacentViews(this);
        this.updateCurrentView(this.range.startTime, this.views[this.currentViewIndex]);
        this.calendarService.rangeChanged(this);
    }
    getTitle() {
        const firstDayOfWeek = new Date(this.range.startTime.getTime());
        firstDayOfWeek.setHours(12, 0, 0, 0);
        return this.formatTitle(firstDayOfWeek);
    }
    getHighlightClass(date) {
        let className = '';
        if (date.hasEvent) {
            if (className) {
                className += ' ';
            }
            className = 'weekview-with-event';
        }
        if (date.selected) {
            if (className) {
                className += ' ';
            }
            className += 'weekview-selected';
        }
        if (date.current) {
            if (className) {
                className += ' ';
            }
            className += 'weekview-current';
        }
        return className;
    }
    select(selectedTime, events) {
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedTime);
        }
        this.onTimeSelected.emit({
            selectedTime,
            events: events.map(e => e.event),
            disabled
        });
    }
    placeEvents(orderedEvents) {
        this.calculatePosition(orderedEvents);
        WeekViewComponent.calculateWidth(orderedEvents, this.hourRange, this.hourParts);
    }
    placeAllDayEvents(orderedEvents) {
        this.calculatePosition(orderedEvents);
    }
    overlap(event1, event2) {
        let earlyEvent = event1, lateEvent = event2;
        if (event1.startIndex > event2.startIndex || (event1.startIndex === event2.startIndex && event1.startOffset > event2.startOffset)) {
            earlyEvent = event2;
            lateEvent = event1;
        }
        if (earlyEvent.endIndex <= lateEvent.startIndex) {
            return false;
        }
        else {
            return !(earlyEvent.endIndex - lateEvent.startIndex === 1 && earlyEvent.endOffset + lateEvent.startOffset >= this.hourParts);
        }
    }
    calculatePosition(events) {
        const len = events.length, isForbidden = new Array(len);
        let maxColumn = 0;
        for (let i = 0; i < len; i += 1) {
            let col;
            for (col = 0; col < maxColumn; col += 1) {
                isForbidden[col] = false;
            }
            for (let j = 0; j < i; j += 1) {
                if (this.overlap(events[i], events[j])) {
                    isForbidden[events[j].position] = true;
                }
            }
            for (col = 0; col < maxColumn; col += 1) {
                if (!isForbidden[col]) {
                    break;
                }
            }
            if (col < maxColumn) {
                events[i].position = col;
            }
            else {
                events[i].position = maxColumn++;
            }
        }
        if (this.dir === 'rtl') {
            for (let i = 0; i < len; i += 1) {
                events[i].position = maxColumn - 1 - events[i].position;
            }
        }
    }
    updateCurrentView(currentViewStartDate, view) {
        const currentCalendarDate = this.calendarService.currentDate, today = new Date(), oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay), currentDayDifference = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        for (let r = 0; r < 7; r += 1) {
            view.dates[r].selected = false;
        }
        if (selectedDayDifference >= 0 && selectedDayDifference < 7 && this.autoSelect) {
            view.dates[selectedDayDifference].selected = true;
        }
        if (currentDayDifference >= 0 && currentDayDifference < 7) {
            view.dates[currentDayDifference].current = true;
        }
    }
    daySelected(viewDate) {
        const selectedDate = viewDate.date, dates = this.views[this.currentViewIndex].dates, currentViewStartDate = this.range.startTime, oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        this.calendarService.setCurrentDate(selectedDate);
        for (let r = 0; r < 7; r += 1) {
            dates[r].selected = false;
        }
        if (selectedDayDifference >= 0 && selectedDayDifference < 7) {
            dates[selectedDayDifference].selected = true;
        }
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedDate);
        }
        this.onDayHeaderSelected.emit({ selectedTime: selectedDate, events: viewDate.events.map(e => e.event), disabled });
    }
    setScrollPosition(scrollPosition) {
        this.initScrollPosition = scrollPosition;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: WeekViewComponent, deps: [{ token: CalendarService }, { token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: WeekViewComponent, isStandalone: false, selector: "weekview", inputs: { weekviewHeaderTemplate: "weekviewHeaderTemplate", weekviewAllDayEventTemplate: "weekviewAllDayEventTemplate", weekviewNormalEventTemplate: "weekviewNormalEventTemplate", weekviewAllDayEventSectionTemplate: "weekviewAllDayEventSectionTemplate", weekviewNormalEventSectionTemplate: "weekviewNormalEventSectionTemplate", weekviewInactiveAllDayEventSectionTemplate: "weekviewInactiveAllDayEventSectionTemplate", weekviewInactiveNormalEventSectionTemplate: "weekviewInactiveNormalEventSectionTemplate", formatWeekTitle: "formatWeekTitle", formatWeekViewDayHeader: "formatWeekViewDayHeader", formatHourColumn: "formatHourColumn", startingDayWeek: "startingDayWeek", allDayLabel: "allDayLabel", hourParts: "hourParts", eventSource: "eventSource", autoSelect: "autoSelect", markDisabled: "markDisabled", locale: "locale", dateFormatter: "dateFormatter", dir: "dir", scrollToHour: "scrollToHour", preserveScrollPosition: "preserveScrollPosition", lockSwipeToPrev: "lockSwipeToPrev", lockSwipeToNext: "lockSwipeToNext", lockSwipes: "lockSwipes", startHour: "startHour", endHour: "endHour", sliderOptions: "sliderOptions", hourSegments: "hourSegments" }, outputs: { onRangeChanged: "onRangeChanged", onEventSelected: "onEventSelected", onTimeSelected: "onTimeSelected", onDayHeaderSelected: "onDayHeaderSelected", onTitleChanged: "onTitleChanged" }, host: { properties: { "class.weekview": "this.class" } }, viewQueries: [{ propertyName: "swiperElement", first: true, predicate: ["weekViewSwiper"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"swiper weekview-swiper\" #weekViewSwiper>\r\n    <div class=\"swiper-wrapper slides-container\" [dir]=\"dir\">\r\n        <div *ngFor=\"let sliderIndex of sliderIndexList\" class=\"swiper-slide slide-container weekview-slide-container\">\r\n            <table class=\"table table-bordered table-fixed weekview-header\">\r\n                <thead>\r\n                    <tr>\r\n                        <th class=\"calendar-hour-column\"></th>\r\n                        <th class=\"weekview-header text-center\" *ngFor=\"let date of views[sliderIndex].dates\"\r\n                            [ngClass]=\"getHighlightClass(date)\" (click)=\"daySelected(date)\">\r\n                            <ng-template [ngTemplateOutlet]=\"weekviewHeaderTemplate\"\r\n                                [ngTemplateOutletContext]=\"{viewDate:date}\">\r\n                            </ng-template>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n            </table>\r\n            <div *ngIf=\"sliderIndex===currentViewIndex\">\r\n                <div class=\"weekview-allday-table\">\r\n                    <div class=\"weekview-allday-label\">{{allDayLabel}}</div>\r\n                    <div class=\"weekview-allday-content-wrapper scroll-content\">\r\n                        <table class=\"table table-fixed weekview-allday-content-table\">\r\n                            <tbody>\r\n                                <tr>\r\n                                    <td *ngFor=\"let day of views[sliderIndex].dates\" class=\"calendar-cell\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewAllDayEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{day:day, eventTemplate:weekviewAllDayEventTemplate}\">\r\n                                        </ng-template>\r\n                                    </td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                    </div>\r\n                </div>\r\n                <init-position-scroll class=\"weekview-normal-event-container\" [initPosition]=\"initScrollPosition\"\r\n                    [emitEvent]=\"preserveScrollPosition\" (onScroll)=\"setScrollPosition($event)\">\r\n                    <table class=\"table table-bordered table-fixed weekview-normal-event-table\">\r\n                        <tbody>\r\n                            <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                                <td class=\"calendar-hour-column text-center\">\r\n                                    {{hourColumnLabels[i]}}\r\n                                </td>\r\n                                <td *ngFor=\"let tm of row\" class=\"calendar-cell\" tappable\r\n                                    (click)=\"select(tm.time, tm.events)\">\r\n                                    <div [ngClass]=\"{'calendar-event-wrap': tm.events}\" *ngIf=\"tm.events\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewNormalEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts, eventTemplate:weekviewNormalEventTemplate}\">\r\n                                        </ng-template>\r\n                                    </div>\r\n                                </td>\r\n                            </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </init-position-scroll>\r\n            </div>\r\n            <div *ngIf=\"sliderIndex!==currentViewIndex\">\r\n                <div class=\"weekview-allday-table\">\r\n                    <div class=\"weekview-allday-label\">{{allDayLabel}}</div>\r\n                    <div class=\"weekview-allday-content-wrapper scroll-content\">\r\n                        <table class=\"table table-fixed weekview-allday-content-table\">\r\n                            <tbody>\r\n                                <tr>\r\n                                    <td *ngFor=\"let day of views[sliderIndex].dates\" class=\"calendar-cell\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewInactiveAllDayEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{day:day}\">\r\n                                        </ng-template>\r\n                                    </td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                    </div>\r\n                </div>\r\n                <init-position-scroll class=\"weekview-normal-event-container\" [initPosition]=\"initScrollPosition\">\r\n                    <table class=\"table table-bordered table-fixed weekview-normal-event-table\">\r\n                        <tbody>\r\n                            <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                                <td class=\"calendar-hour-column text-center\">\r\n                                    {{hourColumnLabels[i]}}\r\n                                </td>\r\n                                <td *ngFor=\"let tm of row\" class=\"calendar-cell\">\r\n                                    <div [ngClass]=\"{'calendar-event-wrap': tm.events}\" *ngIf=\"tm.events\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewInactiveNormalEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts}\">\r\n                                        </ng-template>\r\n                                    </div>\r\n                                </td>\r\n                            </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </init-position-scroll>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>", styles: [".weekview-slide-container .table-fixed{table-layout:fixed}.weekview-slide-container .table{width:100%;max-width:100%;background-color:transparent}.weekview-slide-container .table>thead>tr>th,.weekview-slide-container .table>tbody>tr>th,.weekview-slide-container .table>tfoot>tr>th,.weekview-slide-container .table>thead>tr>td,.weekview-slide-container .table>tbody>tr>td,.weekview-slide-container .table>tfoot>tr>td{padding:8px;line-height:20px;vertical-align:top}.weekview-slide-container .table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}.weekview-slide-container .table>thead:first-child>tr:first-child>th,.weekview-slide-container .table>thead:first-child>tr:first-child>td{border-top:0}.weekview-slide-container .table>tbody+tbody{border-top:2px solid #ddd}.weekview-slide-container .table-bordered{border:1px solid #ddd}.weekview-slide-container .table-bordered>thead>tr>th,.weekview-slide-container .table-bordered>tbody>tr>th,.weekview-slide-container .table-bordered>tfoot>tr>th,.weekview-slide-container .table-bordered>thead>tr>td,.weekview-slide-container .table-bordered>tbody>tr>td,.weekview-slide-container .table-bordered>tfoot>tr>td{border:1px solid #ddd}.weekview-slide-container .table-bordered>thead>tr>th,.weekview-slide-container .table-bordered>thead>tr>td{border-bottom-width:2px}.weekview-slide-container .table-striped>tbody>tr:nth-child(odd)>td,.weekview-slide-container .table-striped>tbody>tr:nth-child(odd)>th{background-color:#f9f9f9}.calendar-hour-column{width:50px;white-space:nowrap}.calendar-event-wrap{position:relative;width:100%;height:100%}.calendar-event{position:absolute;padding:2px;cursor:pointer;z-index:10000}.calendar-cell{padding:0!important;height:37px}.weekview-swiper{height:100%}.weekview-slide-container{display:block!important}.weekview-allday-label{float:left;height:100%;line-height:50px;text-align:center;width:50px;border-left:1px solid #ddd}[dir=rtl] .weekview-allday-label{float:right;border-right:1px solid #ddd}.weekview-allday-content-wrapper{margin-left:50px;overflow:hidden;height:51px}[dir=rtl] .weekview-allday-content-wrapper{margin-left:0;margin-right:50px}.weekview-allday-content-table{min-height:50px}.weekview-allday-content-table td{border-left:1px solid #ddd;border-right:1px solid #ddd}.weekview-header th{overflow:hidden;white-space:nowrap;font-size:14px}.weekview-allday-table{height:50px;position:relative;border-bottom:1px solid #ddd;font-size:14px}.weekview-normal-event-container{margin-top:87px;overflow:hidden;inset:0;position:absolute;font-size:14px}.scroll-content{overflow-y:auto;overflow-x:hidden}::-webkit-scrollbar,*::-webkit-scrollbar{display:none}.weekview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle}@media(max-width:750px){.weekview-allday-label,.calendar-hour-column{width:31px;font-size:12px}.weekview-allday-label{padding-top:4px}.weekview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle;line-height:12px}.weekview-slide-container .table>thead>tr>th.weekview-header{padding-left:0;padding-right:0;font-size:12px}.weekview-allday-label{line-height:20px}.weekview-allday-content-wrapper{margin-left:31px}[dir=rtl] .weekview-allday-content-wrapper{margin-left:0;margin-right:31px}}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: initPositionScrollComponent, selector: "init-position-scroll", inputs: ["initPosition", "emitEvent"], outputs: ["onScroll"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: WeekViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'weekview', encapsulation: ViewEncapsulation.None, standalone: false, template: "<div class=\"swiper weekview-swiper\" #weekViewSwiper>\r\n    <div class=\"swiper-wrapper slides-container\" [dir]=\"dir\">\r\n        <div *ngFor=\"let sliderIndex of sliderIndexList\" class=\"swiper-slide slide-container weekview-slide-container\">\r\n            <table class=\"table table-bordered table-fixed weekview-header\">\r\n                <thead>\r\n                    <tr>\r\n                        <th class=\"calendar-hour-column\"></th>\r\n                        <th class=\"weekview-header text-center\" *ngFor=\"let date of views[sliderIndex].dates\"\r\n                            [ngClass]=\"getHighlightClass(date)\" (click)=\"daySelected(date)\">\r\n                            <ng-template [ngTemplateOutlet]=\"weekviewHeaderTemplate\"\r\n                                [ngTemplateOutletContext]=\"{viewDate:date}\">\r\n                            </ng-template>\r\n                        </th>\r\n                    </tr>\r\n                </thead>\r\n            </table>\r\n            <div *ngIf=\"sliderIndex===currentViewIndex\">\r\n                <div class=\"weekview-allday-table\">\r\n                    <div class=\"weekview-allday-label\">{{allDayLabel}}</div>\r\n                    <div class=\"weekview-allday-content-wrapper scroll-content\">\r\n                        <table class=\"table table-fixed weekview-allday-content-table\">\r\n                            <tbody>\r\n                                <tr>\r\n                                    <td *ngFor=\"let day of views[sliderIndex].dates\" class=\"calendar-cell\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewAllDayEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{day:day, eventTemplate:weekviewAllDayEventTemplate}\">\r\n                                        </ng-template>\r\n                                    </td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                    </div>\r\n                </div>\r\n                <init-position-scroll class=\"weekview-normal-event-container\" [initPosition]=\"initScrollPosition\"\r\n                    [emitEvent]=\"preserveScrollPosition\" (onScroll)=\"setScrollPosition($event)\">\r\n                    <table class=\"table table-bordered table-fixed weekview-normal-event-table\">\r\n                        <tbody>\r\n                            <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                                <td class=\"calendar-hour-column text-center\">\r\n                                    {{hourColumnLabels[i]}}\r\n                                </td>\r\n                                <td *ngFor=\"let tm of row\" class=\"calendar-cell\" tappable\r\n                                    (click)=\"select(tm.time, tm.events)\">\r\n                                    <div [ngClass]=\"{'calendar-event-wrap': tm.events}\" *ngIf=\"tm.events\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewNormalEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts, eventTemplate:weekviewNormalEventTemplate}\">\r\n                                        </ng-template>\r\n                                    </div>\r\n                                </td>\r\n                            </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </init-position-scroll>\r\n            </div>\r\n            <div *ngIf=\"sliderIndex!==currentViewIndex\">\r\n                <div class=\"weekview-allday-table\">\r\n                    <div class=\"weekview-allday-label\">{{allDayLabel}}</div>\r\n                    <div class=\"weekview-allday-content-wrapper scroll-content\">\r\n                        <table class=\"table table-fixed weekview-allday-content-table\">\r\n                            <tbody>\r\n                                <tr>\r\n                                    <td *ngFor=\"let day of views[sliderIndex].dates\" class=\"calendar-cell\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewInactiveAllDayEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{day:day}\">\r\n                                        </ng-template>\r\n                                    </td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                    </div>\r\n                </div>\r\n                <init-position-scroll class=\"weekview-normal-event-container\" [initPosition]=\"initScrollPosition\">\r\n                    <table class=\"table table-bordered table-fixed weekview-normal-event-table\">\r\n                        <tbody>\r\n                            <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                                <td class=\"calendar-hour-column text-center\">\r\n                                    {{hourColumnLabels[i]}}\r\n                                </td>\r\n                                <td *ngFor=\"let tm of row\" class=\"calendar-cell\">\r\n                                    <div [ngClass]=\"{'calendar-event-wrap': tm.events}\" *ngIf=\"tm.events\">\r\n                                        <ng-template [ngTemplateOutlet]=\"weekviewInactiveNormalEventSectionTemplate\"\r\n                                            [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts}\">\r\n                                        </ng-template>\r\n                                    </div>\r\n                                </td>\r\n                            </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </init-position-scroll>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>", styles: [".weekview-slide-container .table-fixed{table-layout:fixed}.weekview-slide-container .table{width:100%;max-width:100%;background-color:transparent}.weekview-slide-container .table>thead>tr>th,.weekview-slide-container .table>tbody>tr>th,.weekview-slide-container .table>tfoot>tr>th,.weekview-slide-container .table>thead>tr>td,.weekview-slide-container .table>tbody>tr>td,.weekview-slide-container .table>tfoot>tr>td{padding:8px;line-height:20px;vertical-align:top}.weekview-slide-container .table>thead>tr>th{vertical-align:bottom;border-bottom:2px solid #ddd}.weekview-slide-container .table>thead:first-child>tr:first-child>th,.weekview-slide-container .table>thead:first-child>tr:first-child>td{border-top:0}.weekview-slide-container .table>tbody+tbody{border-top:2px solid #ddd}.weekview-slide-container .table-bordered{border:1px solid #ddd}.weekview-slide-container .table-bordered>thead>tr>th,.weekview-slide-container .table-bordered>tbody>tr>th,.weekview-slide-container .table-bordered>tfoot>tr>th,.weekview-slide-container .table-bordered>thead>tr>td,.weekview-slide-container .table-bordered>tbody>tr>td,.weekview-slide-container .table-bordered>tfoot>tr>td{border:1px solid #ddd}.weekview-slide-container .table-bordered>thead>tr>th,.weekview-slide-container .table-bordered>thead>tr>td{border-bottom-width:2px}.weekview-slide-container .table-striped>tbody>tr:nth-child(odd)>td,.weekview-slide-container .table-striped>tbody>tr:nth-child(odd)>th{background-color:#f9f9f9}.calendar-hour-column{width:50px;white-space:nowrap}.calendar-event-wrap{position:relative;width:100%;height:100%}.calendar-event{position:absolute;padding:2px;cursor:pointer;z-index:10000}.calendar-cell{padding:0!important;height:37px}.weekview-swiper{height:100%}.weekview-slide-container{display:block!important}.weekview-allday-label{float:left;height:100%;line-height:50px;text-align:center;width:50px;border-left:1px solid #ddd}[dir=rtl] .weekview-allday-label{float:right;border-right:1px solid #ddd}.weekview-allday-content-wrapper{margin-left:50px;overflow:hidden;height:51px}[dir=rtl] .weekview-allday-content-wrapper{margin-left:0;margin-right:50px}.weekview-allday-content-table{min-height:50px}.weekview-allday-content-table td{border-left:1px solid #ddd;border-right:1px solid #ddd}.weekview-header th{overflow:hidden;white-space:nowrap;font-size:14px}.weekview-allday-table{height:50px;position:relative;border-bottom:1px solid #ddd;font-size:14px}.weekview-normal-event-container{margin-top:87px;overflow:hidden;inset:0;position:absolute;font-size:14px}.scroll-content{overflow-y:auto;overflow-x:hidden}::-webkit-scrollbar,*::-webkit-scrollbar{display:none}.weekview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle}@media(max-width:750px){.weekview-allday-label,.calendar-hour-column{width:31px;font-size:12px}.weekview-allday-label{padding-top:4px}.weekview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle;line-height:12px}.weekview-slide-container .table>thead>tr>th.weekview-header{padding-left:0;padding-right:0;font-size:12px}.weekview-allday-label{line-height:20px}.weekview-allday-content-wrapper{margin-left:31px}[dir=rtl] .weekview-allday-content-wrapper{margin-left:0;margin-right:31px}}\n"] }]
        }], ctorParameters: () => [{ type: CalendarService }, { type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { swiperElement: [{
                type: ViewChild,
                args: ['weekViewSwiper']
            }], class: [{
                type: HostBinding,
                args: ['class.weekview']
            }], weekviewHeaderTemplate: [{
                type: Input
            }], weekviewAllDayEventTemplate: [{
                type: Input
            }], weekviewNormalEventTemplate: [{
                type: Input
            }], weekviewAllDayEventSectionTemplate: [{
                type: Input
            }], weekviewNormalEventSectionTemplate: [{
                type: Input
            }], weekviewInactiveAllDayEventSectionTemplate: [{
                type: Input
            }], weekviewInactiveNormalEventSectionTemplate: [{
                type: Input
            }], formatWeekTitle: [{
                type: Input
            }], formatWeekViewDayHeader: [{
                type: Input
            }], formatHourColumn: [{
                type: Input
            }], startingDayWeek: [{
                type: Input
            }], allDayLabel: [{
                type: Input
            }], hourParts: [{
                type: Input
            }], eventSource: [{
                type: Input
            }], autoSelect: [{
                type: Input
            }], markDisabled: [{
                type: Input
            }], locale: [{
                type: Input
            }], dateFormatter: [{
                type: Input
            }], dir: [{
                type: Input
            }], scrollToHour: [{
                type: Input
            }], preserveScrollPosition: [{
                type: Input
            }], lockSwipeToPrev: [{
                type: Input
            }], lockSwipeToNext: [{
                type: Input
            }], lockSwipes: [{
                type: Input
            }], startHour: [{
                type: Input
            }], endHour: [{
                type: Input
            }], sliderOptions: [{
                type: Input
            }], hourSegments: [{
                type: Input
            }], onRangeChanged: [{
                type: Output
            }], onEventSelected: [{
                type: Output
            }], onTimeSelected: [{
                type: Output
            }], onDayHeaderSelected: [{
                type: Output
            }], onTitleChanged: [{
                type: Output
            }] } });

class DayViewComponent {
    constructor(calendarService, elm, zone) {
        this.calendarService = calendarService;
        this.elm = elm;
        this.zone = zone;
        this.class = true;
        this.dir = '';
        this.scrollToHour = 0;
        this.lockSwipeToPrev = false;
        this.lockSwipeToNext = false;
        this.lockSwipes = false;
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter(true);
        this.sliderIndexList = [0, 1, 2];
        this.views = [];
        this.currentViewIndex = 0;
        this.direction = 0;
        this.mode = 'day';
        this.inited = false;
        this.callbackOnInit = true;
    }
    static createDateObjects(startTime, startHour, endHour, timeInterval) {
        const rows = [], currentHour = 0, currentDate = startTime.getDate();
        let time, hourStep, minStep;
        if (timeInterval < 1) {
            hourStep = Math.floor(1 / timeInterval);
            minStep = 60;
        }
        else {
            hourStep = 1;
            minStep = Math.floor(60 / timeInterval);
        }
        for (let hour = startHour; hour < endHour; hour += hourStep) {
            for (let interval = 0; interval < 60; interval += minStep) {
                time = new Date(startTime.getTime());
                time.setHours(currentHour + hour, interval);
                time.setDate(currentDate);
                rows.push({
                    time,
                    events: [],
                    eventsGroupByCategory: new Map()
                });
            }
        }
        return rows;
    }
    static compareEventByStartOffset(eventA, eventB) {
        return eventA.startOffset - eventB.startOffset;
    }
    static calculateWidth(orderedEvents, size, hourParts) {
        const totalSize = size * hourParts, cells = new Array(totalSize);
        // sort by position in descending order, the right most columns should be calculated first
        orderedEvents.sort((eventA, eventB) => {
            return eventB.position - eventA.position;
        });
        for (let i = 0; i < totalSize; i += 1) {
            cells[i] = {
                calculated: false,
                events: []
            };
        }
        const len = orderedEvents.length;
        for (let i = 0; i < len; i += 1) {
            const event = orderedEvents[i];
            let index = event.startIndex * hourParts + event.startOffset;
            while (index < event.endIndex * hourParts - event.endOffset) {
                cells[index].events.push(event);
                index += 1;
            }
        }
        let i = 0;
        while (i < len) {
            let event = orderedEvents[i];
            if (!event.overlapNumber) {
                const overlapNumber = event.position + 1;
                event.overlapNumber = overlapNumber;
                const eventQueue = [event];
                while ((event = eventQueue.shift())) {
                    let index = event.startIndex * hourParts + event.startOffset;
                    while (index < event.endIndex * hourParts - event.endOffset) {
                        if (!cells[index].calculated) {
                            cells[index].calculated = true;
                            if (cells[index].events) {
                                const eventCountInCell = cells[index].events.length;
                                for (let j = 0; j < eventCountInCell; j += 1) {
                                    const currentEventInCell = cells[index].events[j];
                                    if (!currentEventInCell.overlapNumber) {
                                        currentEventInCell.overlapNumber = overlapNumber;
                                        eventQueue.push(currentEventInCell);
                                    }
                                }
                            }
                        }
                        index += 1;
                    }
                }
            }
            i += 1;
        }
    }
    ngOnInit() {
        if (!this.sliderOptions) {
            this.sliderOptions = {};
        }
        this.sliderOptions.loop = true;
        this.sliderOptions.allowSlidePrev = !this.lockSwipeToPrev;
        this.sliderOptions.allowSlideNext = !this.lockSwipeToNext;
        this.sliderOptions.allowTouchMove = !this.lockSwipes;
        this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
        if (this.dateFormatter && this.dateFormatter.formatDayViewTitle) {
            this.formatTitle = this.dateFormatter.formatDayViewTitle;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe.transform(date, this.formatDayTitle) || '';
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatDayViewHourColumn) {
            this.formatHourColumnLabel = this.dateFormatter.formatDayViewHourColumn;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatHourColumnLabel = function (date) {
                return datePipe.transform(date, this.formatHourColumn) || '';
            };
        }
        this.refreshView();
        this.hourColumnLabels = this.getHourColumnLabels();
        this.inited = true;
        this.currentDateChangedFromParentSubscription = this.calendarService.currentDateChangedFromParent$.subscribe(currentDate => {
            this.refreshView();
        });
        this.eventSourceChangedSubscription = this.calendarService.eventSourceChanged$.subscribe(() => {
            this.onDataLoaded();
        });
        this.slideChangedSubscription = this.calendarService.slideChanged$.subscribe(direction => {
            if (direction === 1) {
                this.slider.slideNext();
            }
            else if (direction === -1) {
                this.slider.slidePrev();
            }
        });
        this.slideUpdatedSubscription = this.calendarService.slideUpdated$.subscribe(() => {
            this.slider.update();
        });
    }
    ngAfterViewInit() {
        this.slider = new Swiper(this.swiperElement?.nativeElement, this.sliderOptions);
        let me = this;
        this.slider.on('slideNextTransitionEnd', function () {
            me.onSlideChanged(1);
        });
        this.slider.on('slidePrevTransitionEnd', function () {
            me.onSlideChanged(-1);
        });
        if (this.dir === 'rtl') {
            this.slider.changeLanguageDirection('rtl');
        }
        const title = this.getTitle();
        this.onTitleChanged.emit(title);
        if (this.scrollToHour > 0) {
            const hourColumns = this.elm.nativeElement
                .querySelector('.dayview-normal-event-container')
                .querySelectorAll('.calendar-hour-column');
            const me = this;
            setTimeout(() => {
                me.initScrollPosition = hourColumns[me.scrollToHour - me.startHour].offsetTop;
            }, 50);
        }
    }
    ngOnChanges(changes) {
        if (!this.inited) {
            return;
        }
        if ((changes['startHour'] || changes['endHour']) &&
            (!changes['startHour'].isFirstChange() || !changes['endHour'].isFirstChange())) {
            this.views = [];
            this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
            this.direction = 0;
            this.refreshView();
            this.hourColumnLabels = this.getHourColumnLabels();
        }
        const eventSourceChange = changes['eventSource'];
        if (eventSourceChange && eventSourceChange.currentValue) {
            this.onDataLoaded();
        }
        const lockSwipeToPrev = changes['lockSwipeToPrev'];
        if (lockSwipeToPrev) {
            this.slider.allowSlidePrev = !lockSwipeToPrev.currentValue;
        }
        const lockSwipeToNext = changes['lockSwipeToNext'];
        if (lockSwipeToPrev) {
            this.slider.allowSlideNext = !lockSwipeToNext.currentValue;
        }
        const lockSwipes = changes['lockSwipes'];
        if (lockSwipes) {
            this.slider.allowTouchMove = !lockSwipes.currentValue;
        }
    }
    ngOnDestroy() {
        if (this.currentDateChangedFromParentSubscription) {
            this.currentDateChangedFromParentSubscription.unsubscribe();
            this.currentDateChangedFromParentSubscription = undefined;
        }
        if (this.eventSourceChangedSubscription) {
            this.eventSourceChangedSubscription.unsubscribe();
            this.eventSourceChangedSubscription = undefined;
        }
        if (this.slideChangedSubscription) {
            this.slideChangedSubscription.unsubscribe();
            this.slideChangedSubscription = undefined;
        }
        if (this.slideUpdatedSubscription) {
            this.slideUpdatedSubscription.unsubscribe();
            this.slideUpdatedSubscription = undefined;
        }
    }
    onSlideChanged(direction) {
        this.currentViewIndex = (this.currentViewIndex + direction + 3) % 3;
        this.move(direction);
    }
    move(direction) {
        if (direction === 0) {
            return;
        }
        this.direction = direction;
        const adjacentDate = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
        this.calendarService.setCurrentDate(adjacentDate);
        this.refreshView();
        this.direction = 0;
    }
    getHourColumnLabels() {
        const hourColumnLabels = [];
        for (let hour = 0, length = this.views[0].rows.length; hour < length; hour += 1) {
            // handle edge case for DST
            if (hour === 0 && this.views[0].rows[hour].time.getHours() !== this.startHour) {
                const time = new Date(this.views[0].rows[hour].time);
                time.setDate(time.getDate() + 1);
                time.setHours(this.startHour);
                hourColumnLabels.push(this.formatHourColumnLabel(time));
            }
            else {
                hourColumnLabels.push(this.formatHourColumnLabel(this.views[0].rows[hour].time));
            }
        }
        return hourColumnLabels;
    }
    getViewData(startTime) {
        return {
            rows: DayViewComponent.createDateObjects(startTime, this.startHour, this.endHour, this.hourSegments),
            allDayEvents: [],
            categorizedAllDayEventsMap: new Map()
        };
    }
    getRange(currentDate) {
        const year = currentDate.getFullYear(), month = currentDate.getMonth(), date = currentDate.getDate(), startTime = new Date(year, month, date, 12, 0, 0), endTime = new Date(year, month, date + 1, 12, 0, 0);
        return {
            startTime,
            endTime
        };
    }
    onDataLoaded() {
        const eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = this.range.startTime, endTime = this.range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, rows = this.views[currentViewIndex].rows, allDayEvents = (this.views[currentViewIndex].allDayEvents = []), oneHour = 3600000, eps = 0.016, rangeStartRowIndex = this.startHour * this.hourSegments, rangeEndRowIndex = this.endHour * this.hourSegments;
        let normalEventInRange = false;
        for (let hour = 0; hour < this.hourRange; hour += 1) {
            rows[hour].events = [];
            rows[hour].eventsGroupByCategory = undefined;
        }
        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i];
            const eventStartTime = event.startTime;
            const eventEndTime = event.endTime;
            let eventUTCStartTime, eventUTCEndTime;
            if (event.allDay) {
                eventUTCStartTime = eventStartTime.getTime();
                eventUTCEndTime = eventEndTime.getTime();
            }
            else {
                eventUTCStartTime = Date.UTC(eventStartTime.getFullYear(), eventStartTime.getMonth(), eventStartTime.getDate());
                eventUTCEndTime = Date.UTC(eventEndTime.getFullYear(), eventEndTime.getMonth(), eventEndTime.getDate() + 1);
            }
            if (eventUTCEndTime <= utcStartTime || eventUTCStartTime >= utcEndTime || eventStartTime >= eventEndTime) {
                continue;
            }
            if (event.allDay) {
                allDayEvents.push({
                    event
                });
            }
            else {
                normalEventInRange = true;
                let timeDifferenceStart;
                if (eventUTCStartTime < utcStartTime) {
                    timeDifferenceStart = 0;
                }
                else {
                    timeDifferenceStart =
                        (eventStartTime.getHours() + eventStartTime.getMinutes() / 60) * this.hourSegments;
                }
                let timeDifferenceEnd;
                if (eventUTCEndTime > utcEndTime) {
                    timeDifferenceEnd = ((utcEndTime - utcStartTime) / oneHour) * this.hourSegments;
                }
                else {
                    timeDifferenceEnd = (eventEndTime.getHours() + eventEndTime.getMinutes() / 60) * this.hourSegments;
                }
                let startIndex = Math.floor(timeDifferenceStart);
                let endIndex = Math.ceil(timeDifferenceEnd - eps);
                let startOffset = 0;
                let endOffset = 0;
                if (this.hourParts !== 1) {
                    if (startIndex < rangeStartRowIndex) {
                        startOffset = 0;
                    }
                    else {
                        startOffset = Math.floor((timeDifferenceStart - startIndex) * this.hourParts);
                    }
                    if (endIndex > rangeEndRowIndex) {
                        endOffset = 0;
                    }
                    else {
                        endOffset = Math.floor((endIndex - timeDifferenceEnd) * this.hourParts);
                    }
                }
                if (startIndex < rangeStartRowIndex) {
                    startIndex = 0;
                }
                else {
                    startIndex -= rangeStartRowIndex;
                }
                if (endIndex > rangeEndRowIndex) {
                    endIndex = rangeEndRowIndex;
                }
                endIndex -= rangeStartRowIndex;
                if (startIndex < endIndex) {
                    const displayEvent = {
                        event,
                        startIndex,
                        endIndex,
                        startOffset,
                        endOffset,
                        position: 0
                    };
                    let eventSet = rows[startIndex].events;
                    if (eventSet) {
                        eventSet.push(displayEvent);
                    }
                    else {
                        eventSet = [];
                        eventSet.push(displayEvent);
                        rows[startIndex].events = eventSet;
                    }
                    // setup eventsGroupedByCategory
                    if (this.dayviewShowCategoryView && this.dayviewCategorySource && event.category) {
                        let groupedEvents = rows[startIndex].eventsGroupByCategory;
                        if (groupedEvents) {
                            if (Array.isArray(groupedEvents.get(event.category))) {
                                groupedEvents.get(event.category)?.push(displayEvent);
                            }
                            else {
                                groupedEvents.set(event.category, [displayEvent]);
                            }
                        }
                        else {
                            groupedEvents = new Map();
                            groupedEvents.set(event.category, [displayEvent]);
                            rows[startIndex].eventsGroupByCategory = groupedEvents;
                        }
                    }
                }
            }
        }
        if (normalEventInRange) {
            if (this.dayviewShowCategoryView && this.dayviewCategorySource) {
                for (const category of this.dayviewCategorySource) {
                    let displayEvents = [];
                    for (let hour = 0; hour < this.hourRange; hour += 1) {
                        let groupedEvents = rows[hour].eventsGroupByCategory?.get(category);
                        if (groupedEvents) {
                            groupedEvents.sort(DayViewComponent.compareEventByStartOffset);
                            displayEvents = displayEvents.concat(groupedEvents);
                        }
                    }
                    if (displayEvents.length > 0) {
                        this.placeEvents(displayEvents);
                    }
                }
            }
            else {
                let orderedEvents = [];
                for (let hour = 0; hour < this.hourRange; hour += 1) {
                    if (rows[hour].events) {
                        rows[hour].events.sort(DayViewComponent.compareEventByStartOffset);
                        orderedEvents = orderedEvents.concat(rows[hour].events);
                    }
                }
                if (orderedEvents.length > 0) {
                    this.placeEvents(orderedEvents);
                }
            }
        }
        if (this.dayviewShowCategoryView && this.dayviewCategorySource) {
            this.categorizeAllDayEvents(allDayEvents);
        }
    }
    categorizeAllDayEvents(allDayEvents) {
        const categoryIdAllDayEventsMap = (this.views[this.currentViewIndex].categorizedAllDayEventsMap = new Map());
        for (const displayAllDayEvent of allDayEvents) {
            if (displayAllDayEvent.event.category) {
                if (categoryIdAllDayEventsMap.get(displayAllDayEvent.event.category)) {
                    categoryIdAllDayEventsMap.get(displayAllDayEvent.event.category)?.push(displayAllDayEvent);
                }
                else {
                    categoryIdAllDayEventsMap.set(displayAllDayEvent.event.category, [displayAllDayEvent]);
                }
            }
        }
    }
    refreshView() {
        this.range = this.getRange(this.calendarService.currentDate);
        if (this.inited) {
            const title = this.getTitle();
            this.onTitleChanged.emit(title);
        }
        this.calendarService.populateAdjacentViews(this);
        this.calendarService.rangeChanged(this);
    }
    getTitle() {
        const startingDate = new Date(this.range.startTime.getTime());
        startingDate.setHours(12, 0, 0, 0);
        return this.formatTitle(startingDate);
    }
    select(row, category) {
        const selectedTime = row.time;
        let events = row.events;
        if (category) {
            events = row.eventsGroupByCategory?.get(category) || [];
        }
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedTime);
        }
        this.onTimeSelected.emit({
            selectedTime,
            category,
            events: events.map(e => e.event),
            disabled
        });
    }
    placeEvents(orderedEvents) {
        this.calculatePosition(orderedEvents);
        DayViewComponent.calculateWidth(orderedEvents, this.hourRange, this.hourParts);
    }
    placeAllDayEvents(orderedEvents) {
        this.calculatePosition(orderedEvents);
    }
    overlap(event1, event2) {
        let earlyEvent = event1, lateEvent = event2;
        if (event1.startIndex > event2.startIndex ||
            (event1.startIndex === event2.startIndex && event1.startOffset > event2.startOffset)) {
            earlyEvent = event2;
            lateEvent = event1;
        }
        if (earlyEvent.endIndex <= lateEvent.startIndex) {
            return false;
        }
        else {
            return !(earlyEvent.endIndex - lateEvent.startIndex === 1 &&
                earlyEvent.endOffset + lateEvent.startOffset >= this.hourParts);
        }
    }
    calculatePosition(events) {
        const len = events.length, isForbidden = new Array(len);
        let maxColumn = 0, col;
        for (let i = 0; i < len; i += 1) {
            for (col = 0; col < maxColumn; col += 1) {
                isForbidden[col] = false;
            }
            for (let j = 0; j < i; j += 1) {
                if (this.overlap(events[i], events[j])) {
                    isForbidden[events[j].position] = true;
                }
            }
            for (col = 0; col < maxColumn; col += 1) {
                if (!isForbidden[col]) {
                    break;
                }
            }
            if (col < maxColumn) {
                events[i].position = col;
            }
            else {
                events[i].position = maxColumn++;
            }
        }
        if (this.dir === 'rtl') {
            for (let i = 0; i < len; i += 1) {
                events[i].position = maxColumn - 1 - events[i].position;
            }
        }
    }
    eventSelected(event) {
        this.onEventSelected.emit(event);
    }
    setScrollPosition(scrollPosition) {
        this.initScrollPosition = scrollPosition;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DayViewComponent, deps: [{ token: CalendarService }, { token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: DayViewComponent, isStandalone: false, selector: "dayview", inputs: { dayviewCategoryItemTemplate: "dayviewCategoryItemTemplate", dayviewAllDayEventTemplate: "dayviewAllDayEventTemplate", dayviewNormalEventTemplate: "dayviewNormalEventTemplate", dayviewAllDayEventSectionTemplate: "dayviewAllDayEventSectionTemplate", dayviewNormalEventSectionTemplate: "dayviewNormalEventSectionTemplate", dayviewInactiveAllDayEventSectionTemplate: "dayviewInactiveAllDayEventSectionTemplate", dayviewInactiveNormalEventSectionTemplate: "dayviewInactiveNormalEventSectionTemplate", formatHourColumn: "formatHourColumn", formatDayTitle: "formatDayTitle", allDayLabel: "allDayLabel", hourParts: "hourParts", eventSource: "eventSource", markDisabled: "markDisabled", locale: "locale", dateFormatter: "dateFormatter", dir: "dir", scrollToHour: "scrollToHour", preserveScrollPosition: "preserveScrollPosition", lockSwipeToPrev: "lockSwipeToPrev", lockSwipeToNext: "lockSwipeToNext", lockSwipes: "lockSwipes", startHour: "startHour", endHour: "endHour", sliderOptions: "sliderOptions", hourSegments: "hourSegments", dayviewCategorySource: "dayviewCategorySource", dayviewShowCategoryView: "dayviewShowCategoryView" }, outputs: { onRangeChanged: "onRangeChanged", onEventSelected: "onEventSelected", onTimeSelected: "onTimeSelected", onTitleChanged: "onTitleChanged" }, host: { properties: { "class.dayview": "this.class" } }, viewQueries: [{ propertyName: "swiperElement", first: true, predicate: ["dayViewSwiper"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"swiper dayview-swiper\" #dayViewSwiper>\r\n  <div class=\"swiper-wrapper slides-container\" [dir]=\"dir\">\r\n    <div *ngFor=\"let sliderIndex of sliderIndexList\" class=\"swiper-slide slide-container dayview-slide-container\">\r\n      <ng-container *ngIf=\"!dayviewShowCategoryView\">\r\n        <div class=\"dayview-allday-table\">\r\n          <div class=\"dayview-allday-label\">{{allDayLabel}}</div>\r\n          <div class=\"dayview-allday-content-wrapper scroll-content\">\r\n            <table class=\"table table-bordered dayview-allday-content-table\">\r\n              <tbody>\r\n                <tr>\r\n                  <td *ngIf=\"sliderIndex===currentViewIndex\" class=\"calendar-cell\"\r\n                    [ngClass]=\"{'calendar-event-wrap':views[sliderIndex].allDayEvents.length>0}\"\r\n                    [ngStyle]=\"{height: 25*views[sliderIndex].allDayEvents.length+'px'}\">\r\n                    <ng-template [ngTemplateOutlet]=\"dayviewAllDayEventSectionTemplate\"\r\n                      [ngTemplateOutletContext]=\"{allDayEvents:views[sliderIndex].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}\">\r\n                    </ng-template>\r\n                  </td>\r\n                  <td *ngIf=\"sliderIndex!==currentViewIndex\" class=\"calendar-cell\"\r\n                    [ngClass]=\"{'calendar-event-wrap':views[sliderIndex].allDayEvents.length>0}\"\r\n                    [ngStyle]=\"{height: 25*views[sliderIndex].allDayEvents.length+'px'}\">\r\n                    <ng-template [ngTemplateOutlet]=\"dayviewInactiveAllDayEventSectionTemplate\"\r\n                      [ngTemplateOutletContext]=\"{allDayEvents:views[sliderIndex].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}\">\r\n                    </ng-template>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n        <init-position-scroll *ngIf=\"sliderIndex===currentViewIndex\" class=\"dayview-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\" [emitEvent]=\"preserveScrollPosition\"\r\n          (onScroll)=\"setScrollPosition($event)\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let tm of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{hourColumnLabels[i]}}\r\n                </td>\r\n                <td class=\"calendar-cell\" tappable (click)=\"select(tm)\">\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n        <init-position-scroll *ngIf=\"sliderIndex!==currentViewIndex\" class=\"dayview-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let tm of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{hourColumnLabels[i]}}\r\n                </td>\r\n                <td class=\"calendar-cell\">\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewInactiveNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n      </ng-container>\r\n\r\n      <ng-container *ngIf=\"dayviewShowCategoryView\">\r\n        <div class=\"dayview-category-header\">\r\n          <table class=\"table table-fixed table-bordered dayview-category-header-table\">\r\n            <thead>\r\n              <tr>\r\n                <th class=\"dayview-category-header-item calendar-hour-column\"></th>\r\n                <th *ngFor=\"let category of dayviewCategorySource\" class=\"dayview-category-header-item\">\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewCategoryItemTemplate\" [ngTemplateOutletContext]=\"{category}\">\r\n                  </ng-template>\r\n                </th>\r\n              </tr>\r\n            </thead>\r\n          </table>\r\n        </div>\r\n\r\n        <div class=\"dayview-allday-table\">\r\n          <div class=\"dayview-allday-label\">{{ allDayLabel }}</div>\r\n          <div class=\"dayview-allday-content-wrapper dayview-allday-category-wrapper scroll-content\">\r\n            <table class=\"table table-fixed table-bordered dayview-allday-content-table\">\r\n              <tbody>\r\n                <tr>\r\n                  <td class=\"calendar-cell\" *ngFor=\"let category of dayviewCategorySource\">\r\n                    <div class=\"calendar-event-wrap\">\r\n                      <ng-template *ngIf=\"sliderIndex === currentViewIndex\"\r\n                        [ngTemplateOutlet]=\"dayviewAllDayEventSectionTemplate\"\r\n                        [ngTemplateOutletContext]=\"{allDayEvents: views[currentViewIndex].categorizedAllDayEventsMap.get(category)!, eventTemplate: dayviewAllDayEventTemplate}\">\r\n                      </ng-template>\r\n                      <ng-template *ngIf=\"sliderIndex !== currentViewIndex \"\r\n                        [ngTemplateOutlet]=\"dayviewInactiveAllDayEventSectionTemplate\"\r\n                        [ngTemplateOutletContext]=\"{allDayEvents: views[currentViewIndex].categorizedAllDayEventsMap.get(category)!, eventTemplate: dayviewAllDayEventTemplate}\">\r\n                      </ng-template>\r\n                    </div>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n        <init-position-scroll *ngIf=\"sliderIndex === currentViewIndex\"\r\n          class=\"dayview-normal-event-container dayview-categorized-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\" [emitEvent]=\"preserveScrollPosition\"\r\n          (onScroll)=\"setScrollPosition($event)\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{ hourColumnLabels[i] }}\r\n                </td>\r\n                <td *ngIf=\"dayviewCategorySource?.size === 0\" class=\"calendar-cell\" (click)=\"select(row)\" tappable>\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: [], time: row.time }, hourParts, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n                <td *ngFor=\"let category of dayviewCategorySource\" class=\"calendar-cell\" (click)=\"select(row, category)\"\r\n                  tappable>\r\n                  <ng-template\r\n                    [ngTemplateOutlet]=\"dayviewNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: row.eventsGroupByCategory?.get(category)!, time: row.time }, hourParts, category, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n\r\n        <init-position-scroll *ngIf=\"sliderIndex !== currentViewIndex\"\r\n          class=\"dayview-normal-event-container dayview-categorized-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{ hourColumnLabels[i] }}\r\n                </td>\r\n                <td *ngIf=\"dayviewCategorySource?.size === 0\" class=\"calendar-cell\" (click)=\"select(row)\" tappable>\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewInactiveNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: [], time: row.time }, hourParts, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n                <td *ngFor=\"let category of dayviewCategorySource\" class=\"calendar-cell\" (click)=\"select(row, category)\"\r\n                  tappable>\r\n                  <ng-template\r\n                    [ngTemplateOutlet]=\"dayviewInactiveNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: row.eventsGroupByCategory?.get(category)!, time: row.time }, hourParts, category, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n      </ng-container>\r\n    </div>\r\n  </div>\r\n</div>", styles: [".dayview-slide-container .table-fixed{table-layout:fixed}.dayview-slide-container .table{width:100%;max-width:100%;background-color:transparent}.dayview-slide-container .table>thead>tr>th,.dayview-slide-container .table>tbody>tr>th,.dayview-slide-container .table>tfoot>tr>th,.dayview-slide-container .table>thead>tr>td,.dayview-slide-container .table>tbody>tr>td,.dayview-slide-container .table>tfoot>tr>td{padding:8px;line-height:20px;vertical-align:top}.dayview-slide-container .table>thead>tr>th{vertical-align:bottom}.dayview-slide-container .table>thead:first-child>tr:first-child>th,.dayview-slide-container .table>thead:first-child>tr:first-child>td{border-top:0}.dayview-slide-container .table>tbody+tbody{border-top:2px solid #ddd}.dayview-slide-container .table-bordered{border:1px solid #ddd}.dayview-slide-container .table-bordered>thead>tr>th,.dayview-slide-container .table-bordered>tbody>tr>th,.dayview-slide-container .table-bordered>tfoot>tr>th,.dayview-slide-container .table-bordered>thead>tr>td,.dayview-slide-container .table-bordered>tbody>tr>td,.dayview-slide-container .table-bordered>tfoot>tr>td{border:1px solid #ddd}.dayview-slide-container .table-bordered>thead>tr>th,.dayview-slide-container .table-bordered>thead>tr>td{border-bottom-width:2px}.dayview-slide-container .table-striped>tbody>tr:nth-child(odd)>td,.dayview-slide-container .table-striped>tbody>tr:nth-child(odd)>th{background-color:#f9f9f9}.calendar-hour-column{width:50px;white-space:nowrap}.calendar-event-wrap{position:relative;width:100%;height:100%}.calendar-event{position:absolute;padding:2px;cursor:pointer;z-index:10000}.dayview-swiper{height:100%}.calendar-cell{padding:0!important;height:37px}.dayview-slide-container{display:block!important}.dayview-category-header{position:relative;font-size:14px}.dayview-category-header-item{font-weight:400;height:37px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dayview-allday-label{float:left;height:100%;line-height:50px;text-align:center;width:50px;border-top:1px solid #ddd;border-left:1px solid #ddd}[dir=rtl] .dayview-allday-label{border-left:none;border-right:1px solid #ddd;float:right}.dayview-allday-content-wrapper{margin-left:50px;overflow:hidden;height:51px}[dir=rtl] .dayview-allday-content-wrapper{margin-left:0;margin-right:50px}.dayview-allday-category-wrapper{height:50px;margin-top:-1px}.dayview-allday-content-table{min-height:50px}.dayview-allday-table{height:50px;position:relative;border-bottom:1px solid #ddd;font-size:14px}.dayview-normal-event-container{margin-top:50px;overflow:hidden;inset:0;position:absolute;font-size:14px}.dayview-categorized-normal-event-container{margin-top:87px}.scroll-content{overflow-y:auto;overflow-x:hidden}::-webkit-scrollbar,*::-webkit-scrollbar{display:none}.dayview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle}@media(max-width:750px){.dayview-allday-label,.calendar-hour-column{width:31px;font-size:12px}.dayview-allday-label{padding-top:4px}.dayview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle;line-height:12px}.dayview-allday-label{line-height:20px}.dayview-allday-content-wrapper{margin-left:31px}[dir=rtl] .dayview-allday-content-wrapper{margin-left:0;margin-right:31px}}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i2.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: initPositionScrollComponent, selector: "init-position-scroll", inputs: ["initPosition", "emitEvent"], outputs: ["onScroll"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: DayViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'dayview', encapsulation: ViewEncapsulation.None, standalone: false, template: "<div class=\"swiper dayview-swiper\" #dayViewSwiper>\r\n  <div class=\"swiper-wrapper slides-container\" [dir]=\"dir\">\r\n    <div *ngFor=\"let sliderIndex of sliderIndexList\" class=\"swiper-slide slide-container dayview-slide-container\">\r\n      <ng-container *ngIf=\"!dayviewShowCategoryView\">\r\n        <div class=\"dayview-allday-table\">\r\n          <div class=\"dayview-allday-label\">{{allDayLabel}}</div>\r\n          <div class=\"dayview-allday-content-wrapper scroll-content\">\r\n            <table class=\"table table-bordered dayview-allday-content-table\">\r\n              <tbody>\r\n                <tr>\r\n                  <td *ngIf=\"sliderIndex===currentViewIndex\" class=\"calendar-cell\"\r\n                    [ngClass]=\"{'calendar-event-wrap':views[sliderIndex].allDayEvents.length>0}\"\r\n                    [ngStyle]=\"{height: 25*views[sliderIndex].allDayEvents.length+'px'}\">\r\n                    <ng-template [ngTemplateOutlet]=\"dayviewAllDayEventSectionTemplate\"\r\n                      [ngTemplateOutletContext]=\"{allDayEvents:views[sliderIndex].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}\">\r\n                    </ng-template>\r\n                  </td>\r\n                  <td *ngIf=\"sliderIndex!==currentViewIndex\" class=\"calendar-cell\"\r\n                    [ngClass]=\"{'calendar-event-wrap':views[sliderIndex].allDayEvents.length>0}\"\r\n                    [ngStyle]=\"{height: 25*views[sliderIndex].allDayEvents.length+'px'}\">\r\n                    <ng-template [ngTemplateOutlet]=\"dayviewInactiveAllDayEventSectionTemplate\"\r\n                      [ngTemplateOutletContext]=\"{allDayEvents:views[sliderIndex].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}\">\r\n                    </ng-template>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n        <init-position-scroll *ngIf=\"sliderIndex===currentViewIndex\" class=\"dayview-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\" [emitEvent]=\"preserveScrollPosition\"\r\n          (onScroll)=\"setScrollPosition($event)\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let tm of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{hourColumnLabels[i]}}\r\n                </td>\r\n                <td class=\"calendar-cell\" tappable (click)=\"select(tm)\">\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n        <init-position-scroll *ngIf=\"sliderIndex!==currentViewIndex\" class=\"dayview-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let tm of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{hourColumnLabels[i]}}\r\n                </td>\r\n                <td class=\"calendar-cell\">\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewInactiveNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n      </ng-container>\r\n\r\n      <ng-container *ngIf=\"dayviewShowCategoryView\">\r\n        <div class=\"dayview-category-header\">\r\n          <table class=\"table table-fixed table-bordered dayview-category-header-table\">\r\n            <thead>\r\n              <tr>\r\n                <th class=\"dayview-category-header-item calendar-hour-column\"></th>\r\n                <th *ngFor=\"let category of dayviewCategorySource\" class=\"dayview-category-header-item\">\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewCategoryItemTemplate\" [ngTemplateOutletContext]=\"{category}\">\r\n                  </ng-template>\r\n                </th>\r\n              </tr>\r\n            </thead>\r\n          </table>\r\n        </div>\r\n\r\n        <div class=\"dayview-allday-table\">\r\n          <div class=\"dayview-allday-label\">{{ allDayLabel }}</div>\r\n          <div class=\"dayview-allday-content-wrapper dayview-allday-category-wrapper scroll-content\">\r\n            <table class=\"table table-fixed table-bordered dayview-allday-content-table\">\r\n              <tbody>\r\n                <tr>\r\n                  <td class=\"calendar-cell\" *ngFor=\"let category of dayviewCategorySource\">\r\n                    <div class=\"calendar-event-wrap\">\r\n                      <ng-template *ngIf=\"sliderIndex === currentViewIndex\"\r\n                        [ngTemplateOutlet]=\"dayviewAllDayEventSectionTemplate\"\r\n                        [ngTemplateOutletContext]=\"{allDayEvents: views[currentViewIndex].categorizedAllDayEventsMap.get(category)!, eventTemplate: dayviewAllDayEventTemplate}\">\r\n                      </ng-template>\r\n                      <ng-template *ngIf=\"sliderIndex !== currentViewIndex \"\r\n                        [ngTemplateOutlet]=\"dayviewInactiveAllDayEventSectionTemplate\"\r\n                        [ngTemplateOutletContext]=\"{allDayEvents: views[currentViewIndex].categorizedAllDayEventsMap.get(category)!, eventTemplate: dayviewAllDayEventTemplate}\">\r\n                      </ng-template>\r\n                    </div>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n        <init-position-scroll *ngIf=\"sliderIndex === currentViewIndex\"\r\n          class=\"dayview-normal-event-container dayview-categorized-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\" [emitEvent]=\"preserveScrollPosition\"\r\n          (onScroll)=\"setScrollPosition($event)\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{ hourColumnLabels[i] }}\r\n                </td>\r\n                <td *ngIf=\"dayviewCategorySource?.size === 0\" class=\"calendar-cell\" (click)=\"select(row)\" tappable>\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: [], time: row.time }, hourParts, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n                <td *ngFor=\"let category of dayviewCategorySource\" class=\"calendar-cell\" (click)=\"select(row, category)\"\r\n                  tappable>\r\n                  <ng-template\r\n                    [ngTemplateOutlet]=\"dayviewNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: row.eventsGroupByCategory?.get(category)!, time: row.time }, hourParts, category, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n\r\n        <init-position-scroll *ngIf=\"sliderIndex !== currentViewIndex\"\r\n          class=\"dayview-normal-event-container dayview-categorized-normal-event-container\"\r\n          [initPosition]=\"initScrollPosition\">\r\n          <table class=\"table table-bordered table-fixed dayview-normal-event-table\">\r\n            <tbody>\r\n              <tr *ngFor=\"let row of views[sliderIndex].rows; let i = index\">\r\n                <td class=\"calendar-hour-column text-center\">\r\n                  {{ hourColumnLabels[i] }}\r\n                </td>\r\n                <td *ngIf=\"dayviewCategorySource?.size === 0\" class=\"calendar-cell\" (click)=\"select(row)\" tappable>\r\n                  <ng-template [ngTemplateOutlet]=\"dayviewInactiveNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: [], time: row.time }, hourParts, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n                <td *ngFor=\"let category of dayviewCategorySource\" class=\"calendar-cell\" (click)=\"select(row, category)\"\r\n                  tappable>\r\n                  <ng-template\r\n                    [ngTemplateOutlet]=\"dayviewInactiveNormalEventSectionTemplate\"\r\n                    [ngTemplateOutletContext]=\"{tm: { events: row.eventsGroupByCategory?.get(category)!, time: row.time }, hourParts, category, eventTemplate: dayviewNormalEventTemplate}\">\r\n                  </ng-template>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </init-position-scroll>\r\n      </ng-container>\r\n    </div>\r\n  </div>\r\n</div>", styles: [".dayview-slide-container .table-fixed{table-layout:fixed}.dayview-slide-container .table{width:100%;max-width:100%;background-color:transparent}.dayview-slide-container .table>thead>tr>th,.dayview-slide-container .table>tbody>tr>th,.dayview-slide-container .table>tfoot>tr>th,.dayview-slide-container .table>thead>tr>td,.dayview-slide-container .table>tbody>tr>td,.dayview-slide-container .table>tfoot>tr>td{padding:8px;line-height:20px;vertical-align:top}.dayview-slide-container .table>thead>tr>th{vertical-align:bottom}.dayview-slide-container .table>thead:first-child>tr:first-child>th,.dayview-slide-container .table>thead:first-child>tr:first-child>td{border-top:0}.dayview-slide-container .table>tbody+tbody{border-top:2px solid #ddd}.dayview-slide-container .table-bordered{border:1px solid #ddd}.dayview-slide-container .table-bordered>thead>tr>th,.dayview-slide-container .table-bordered>tbody>tr>th,.dayview-slide-container .table-bordered>tfoot>tr>th,.dayview-slide-container .table-bordered>thead>tr>td,.dayview-slide-container .table-bordered>tbody>tr>td,.dayview-slide-container .table-bordered>tfoot>tr>td{border:1px solid #ddd}.dayview-slide-container .table-bordered>thead>tr>th,.dayview-slide-container .table-bordered>thead>tr>td{border-bottom-width:2px}.dayview-slide-container .table-striped>tbody>tr:nth-child(odd)>td,.dayview-slide-container .table-striped>tbody>tr:nth-child(odd)>th{background-color:#f9f9f9}.calendar-hour-column{width:50px;white-space:nowrap}.calendar-event-wrap{position:relative;width:100%;height:100%}.calendar-event{position:absolute;padding:2px;cursor:pointer;z-index:10000}.dayview-swiper{height:100%}.calendar-cell{padding:0!important;height:37px}.dayview-slide-container{display:block!important}.dayview-category-header{position:relative;font-size:14px}.dayview-category-header-item{font-weight:400;height:37px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dayview-allday-label{float:left;height:100%;line-height:50px;text-align:center;width:50px;border-top:1px solid #ddd;border-left:1px solid #ddd}[dir=rtl] .dayview-allday-label{border-left:none;border-right:1px solid #ddd;float:right}.dayview-allday-content-wrapper{margin-left:50px;overflow:hidden;height:51px}[dir=rtl] .dayview-allday-content-wrapper{margin-left:0;margin-right:50px}.dayview-allday-category-wrapper{height:50px;margin-top:-1px}.dayview-allday-content-table{min-height:50px}.dayview-allday-table{height:50px;position:relative;border-bottom:1px solid #ddd;font-size:14px}.dayview-normal-event-container{margin-top:50px;overflow:hidden;inset:0;position:absolute;font-size:14px}.dayview-categorized-normal-event-container{margin-top:87px}.scroll-content{overflow-y:auto;overflow-x:hidden}::-webkit-scrollbar,*::-webkit-scrollbar{display:none}.dayview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle}@media(max-width:750px){.dayview-allday-label,.calendar-hour-column{width:31px;font-size:12px}.dayview-allday-label{padding-top:4px}.dayview-slide-container .table>tbody>tr>td.calendar-hour-column{padding-left:0;padding-right:0;vertical-align:middle;line-height:12px}.dayview-allday-label{line-height:20px}.dayview-allday-content-wrapper{margin-left:31px}[dir=rtl] .dayview-allday-content-wrapper{margin-left:0;margin-right:31px}}\n"] }]
        }], ctorParameters: () => [{ type: CalendarService }, { type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { swiperElement: [{
                type: ViewChild,
                args: ['dayViewSwiper']
            }], class: [{
                type: HostBinding,
                args: ['class.dayview']
            }], dayviewCategoryItemTemplate: [{
                type: Input
            }], dayviewAllDayEventTemplate: [{
                type: Input
            }], dayviewNormalEventTemplate: [{
                type: Input
            }], dayviewAllDayEventSectionTemplate: [{
                type: Input
            }], dayviewNormalEventSectionTemplate: [{
                type: Input
            }], dayviewInactiveAllDayEventSectionTemplate: [{
                type: Input
            }], dayviewInactiveNormalEventSectionTemplate: [{
                type: Input
            }], formatHourColumn: [{
                type: Input
            }], formatDayTitle: [{
                type: Input
            }], allDayLabel: [{
                type: Input
            }], hourParts: [{
                type: Input
            }], eventSource: [{
                type: Input
            }], markDisabled: [{
                type: Input
            }], locale: [{
                type: Input
            }], dateFormatter: [{
                type: Input
            }], dir: [{
                type: Input
            }], scrollToHour: [{
                type: Input
            }], preserveScrollPosition: [{
                type: Input
            }], lockSwipeToPrev: [{
                type: Input
            }], lockSwipeToNext: [{
                type: Input
            }], lockSwipes: [{
                type: Input
            }], startHour: [{
                type: Input
            }], endHour: [{
                type: Input
            }], sliderOptions: [{
                type: Input
            }], hourSegments: [{
                type: Input
            }], dayviewCategorySource: [{
                type: Input
            }], dayviewShowCategoryView: [{
                type: Input
            }], onRangeChanged: [{
                type: Output
            }], onEventSelected: [{
                type: Output
            }], onTimeSelected: [{
                type: Output
            }], onTitleChanged: [{
                type: Output
            }] } });

var Step;
(function (Step) {
    Step[Step["QuarterHour"] = 15] = "QuarterHour";
    Step[Step["HalfHour"] = 30] = "HalfHour";
    Step[Step["Hour"] = 60] = "Hour";
})(Step || (Step = {}));

SwiperCore.use([IonicSlides]);
class CalendarComponent {
    get currentDate() {
        return this._currentDate;
    }
    set currentDate(val) {
        if (!val) {
            val = new Date();
        }
        this._currentDate = val;
        this.calendarService.setCurrentDate(val, true);
        this.onCurrentDateChanged.emit(this._currentDate);
    }
    constructor(calendarService, appLocale, ngZone) {
        this.calendarService = calendarService;
        this.appLocale = appLocale;
        this.ngZone = ngZone;
        this.eventSource = [];
        this.calendarMode = 'month';
        this.formatDay = 'd';
        this.formatDayHeader = 'EEE';
        this.formatDayTitle = 'MMMM dd, yyyy';
        this.formatWeekTitle = 'MMMM yyyy, \'Week\' w';
        this.formatMonthTitle = 'MMMM yyyy';
        this.formatWeekViewDayHeader = 'EEE d';
        this.formatHourColumn = 'ha';
        this.showEventDetail = true;
        this.startingDayMonth = 0;
        this.startingDayWeek = 0;
        this.allDayLabel = 'all day';
        this.noEventsLabel = 'No Events';
        this.queryMode = 'local';
        this.step = Step.Hour;
        this.timeInterval = 60;
        this.autoSelect = true;
        this.dir = "";
        this.scrollToHour = 0;
        this.preserveScrollPosition = false;
        this.lockSwipeToPrev = false;
        this.lockSwipeToNext = false;
        this.lockSwipes = false;
        this.locale = "";
        this.startHour = 0;
        this.endHour = 24;
        this.dayviewShowCategoryView = false;
        this.onCurrentDateChanged = new EventEmitter();
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onDayHeaderSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter(true);
        this._currentDate = new Date();
        this.hourParts = 1;
        this.hourSegments = 1;
        this.locale = appLocale;
    }
    ngOnInit() {
        if (this.autoSelect) {
            if (this.autoSelect.toString() === 'false') {
                this.autoSelect = false;
            }
            else {
                this.autoSelect = true;
            }
        }
        this.hourSegments = 60 / this.timeInterval;
        this.hourParts = 60 / this.step;
        if (this.hourParts <= this.hourSegments) {
            this.hourParts = 1;
        }
        else {
            this.hourParts = this.hourParts / this.hourSegments;
        }
        this.startHour = parseInt(this.startHour.toString());
        this.endHour = parseInt(this.endHour.toString());
        this.calendarService.queryMode = this.queryMode;
        this.currentDateChangedFromChildrenSubscription = this.calendarService.currentDateChangedFromChildren$.subscribe(currentDate => {
            this._currentDate = currentDate;
            this.onCurrentDateChanged.emit(currentDate);
        });
    }
    ngOnDestroy() {
        if (this.currentDateChangedFromChildrenSubscription) {
            this.currentDateChangedFromChildrenSubscription.unsubscribe();
            this.currentDateChangedFromChildrenSubscription = undefined;
        }
    }
    rangeChanged(range) {
        this.onRangeChanged.emit(range);
    }
    eventSelected(event) {
        this.onEventSelected.emit(event);
    }
    timeSelected(timeSelected) {
        this.onTimeSelected.emit(timeSelected);
    }
    daySelected(daySelected) {
        this.onDayHeaderSelected.emit(daySelected);
    }
    titleChanged(title) {
        this.onTitleChanged.emit(title);
    }
    loadEvents() {
        this.calendarService.loadEvents();
    }
    slideNext() {
        this.calendarService.slide(1);
    }
    slidePrev() {
        this.calendarService.slide(-1);
    }
    update() {
        this.calendarService.update();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: CalendarComponent, deps: [{ token: CalendarService }, { token: LOCALE_ID }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.25", type: CalendarComponent, isStandalone: false, selector: "calendar", inputs: { currentDate: "currentDate", eventSource: "eventSource", calendarMode: "calendarMode", formatDay: "formatDay", formatDayHeader: "formatDayHeader", formatDayTitle: "formatDayTitle", formatWeekTitle: "formatWeekTitle", formatMonthTitle: "formatMonthTitle", formatWeekViewDayHeader: "formatWeekViewDayHeader", formatHourColumn: "formatHourColumn", showEventDetail: "showEventDetail", startingDayMonth: "startingDayMonth", startingDayWeek: "startingDayWeek", allDayLabel: "allDayLabel", noEventsLabel: "noEventsLabel", queryMode: "queryMode", step: "step", timeInterval: "timeInterval", autoSelect: "autoSelect", markDisabled: "markDisabled", monthviewDisplayEventTemplate: "monthviewDisplayEventTemplate", monthviewInactiveDisplayEventTemplate: "monthviewInactiveDisplayEventTemplate", monthviewEventDetailTemplate: "monthviewEventDetailTemplate", weekviewHeaderTemplate: "weekviewHeaderTemplate", weekviewAllDayEventTemplate: "weekviewAllDayEventTemplate", weekviewNormalEventTemplate: "weekviewNormalEventTemplate", dayviewCategoryItemTemplate: "dayviewCategoryItemTemplate", dayviewAllDayEventTemplate: "dayviewAllDayEventTemplate", dayviewNormalEventTemplate: "dayviewNormalEventTemplate", weekviewAllDayEventSectionTemplate: "weekviewAllDayEventSectionTemplate", weekviewNormalEventSectionTemplate: "weekviewNormalEventSectionTemplate", dayviewAllDayEventSectionTemplate: "dayviewAllDayEventSectionTemplate", dayviewNormalEventSectionTemplate: "dayviewNormalEventSectionTemplate", weekviewInactiveAllDayEventSectionTemplate: "weekviewInactiveAllDayEventSectionTemplate", weekviewInactiveNormalEventSectionTemplate: "weekviewInactiveNormalEventSectionTemplate", dayviewInactiveAllDayEventSectionTemplate: "dayviewInactiveAllDayEventSectionTemplate", dayviewInactiveNormalEventSectionTemplate: "dayviewInactiveNormalEventSectionTemplate", dateFormatter: "dateFormatter", dir: "dir", scrollToHour: "scrollToHour", preserveScrollPosition: "preserveScrollPosition", lockSwipeToPrev: "lockSwipeToPrev", lockSwipeToNext: "lockSwipeToNext", lockSwipes: "lockSwipes", locale: "locale", startHour: "startHour", endHour: "endHour", sliderOptions: "sliderOptions", dayviewCategorySource: "dayviewCategorySource", dayviewShowCategoryView: "dayviewShowCategoryView" }, outputs: { onCurrentDateChanged: "onCurrentDateChanged", onRangeChanged: "onRangeChanged", onEventSelected: "onEventSelected", onTimeSelected: "onTimeSelected", onDayHeaderSelected: "onDayHeaderSelected", onTitleChanged: "onTitleChanged" }, providers: [CalendarService], ngImport: i0, template: "<ng-template #monthviewDefaultDisplayEventTemplate let-view=\"view\" let-row=\"row\" let-col=\"col\">\r\n    {{view.dates[row*7+col].label}}\r\n</ng-template>\r\n<ng-template #monthviewDefaultEventDetailTemplate let-showEventDetail=\"showEventDetail\" let-selectedDate=\"selectedDate\"\r\n    let-noEventsLabel=\"noEventsLabel\">\r\n    <ion-list class=\"event-detail-container\" has-bouncing=\"false\" *ngIf=\"showEventDetail\" overflow-scroll=\"false\">\r\n        <ion-item *ngFor=\"let event of selectedDate?.events\" (click)=\"eventSelected(event)\">\r\n            <span *ngIf=\"!event.allDay\" class=\"monthview-eventdetail-timecolumn\">{{event.startTime|date: 'HH:mm'}}\r\n                -\r\n                {{event.endTime|date: 'HH:mm'}}\r\n            </span>\r\n            <span *ngIf=\"event.allDay\" class=\"monthview-eventdetail-timecolumn\">{{allDayLabel}}</span>\r\n            <span class=\"event-detail\"> | {{event.title}} </span>\r\n            <span class=\"event-detail event-category-detail\" *ngIf=\"event.categoryId\">[{{event.categoryName}}]</span>\r\n        </ion-item>\r\n        <ion-item *ngIf=\"selectedDate?.events.length==0\">\r\n            <div class=\"no-events-label\">{{noEventsLabel}}</div>\r\n        </ion-item>\r\n    </ion-list>\r\n</ng-template>\r\n<ng-template #defaultWeekviewHeaderTemplate let-viewDate=\"viewDate\">\r\n    {{ viewDate.dayHeader }}\r\n</ng-template>\r\n<ng-template #defaultCategoryItemTemplate let-category=\"category\">\r\n    {{ category }}\r\n</ng-template>\r\n<ng-template #defaultAllDayEventTemplate let-displayEvent=\"displayEvent\">\r\n    <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>\r\n</ng-template>\r\n<ng-template #defaultNormalEventTemplate let-displayEvent=\"displayEvent\">\r\n    <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>\r\n</ng-template>\r\n<ng-template #defaultWeekViewAllDayEventSectionTemplate let-day=\"day\" let-eventTemplate=\"eventTemplate\">\r\n    <div [ngClass]=\"{'calendar-event-wrap': day.events}\" *ngIf=\"day.events\"\r\n        [ngStyle]=\"{height: 25*day.events.length+'px'}\">\r\n        <div *ngFor=\"let displayEvent of day.events\" class=\"calendar-event\" tappable\r\n            (click)=\"eventSelected(displayEvent.event)\"\r\n            [ngStyle]=\"{top: 25*displayEvent.position+'px', width: 100*(displayEvent.endIndex-displayEvent.startIndex)+'%', height: '25px'}\">\r\n            <ng-template [ngTemplateOutlet]=\"eventTemplate\" [ngTemplateOutletContext]=\"{displayEvent:displayEvent}\">\r\n            </ng-template>\r\n        </div>\r\n    </div>\r\n</ng-template>\r\n<ng-template #defaultDayViewAllDayEventSectionTemplate let-allDayEvents=\"allDayEvents\"\r\n    let-eventTemplate=\"eventTemplate\">\r\n    <div *ngFor=\"let displayEvent of allDayEvents; let eventIndex=index\" class=\"calendar-event\" tappable\r\n        (click)=\"eventSelected(displayEvent.event)\" [ngStyle]=\"{top: 25*eventIndex+'px',width: '100%',height:'25px'}\">\r\n        <ng-template [ngTemplateOutlet]=\"eventTemplate\" [ngTemplateOutletContext]=\"{displayEvent:displayEvent}\">\r\n        </ng-template>\r\n    </div>\r\n</ng-template>\r\n<ng-template #defaultNormalEventSectionTemplate let-tm=\"tm\" let-hourParts=\"hourParts\" let-eventTemplate=\"eventTemplate\">\r\n    <div [ngClass]=\"{'calendar-event-wrap': tm.events}\" *ngIf=\"tm.events\">\r\n        <div *ngFor=\"let displayEvent of tm.events\" class=\"calendar-event\" tappable\r\n            (click)=\"eventSelected(displayEvent.event)\"\r\n            [ngStyle]=\"{top: (37*displayEvent.startOffset/hourParts)+'px',left: 100/displayEvent.overlapNumber*displayEvent.position+'%', width: 100/displayEvent.overlapNumber+'%', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+'px'}\">\r\n            <ng-template [ngTemplateOutlet]=\"eventTemplate\" [ngTemplateOutletContext]=\"{displayEvent:displayEvent}\">\r\n            </ng-template>\r\n        </div>\r\n    </div>\r\n</ng-template>\r\n<ng-template #defaultInactiveAllDayEventSectionTemplate>\r\n</ng-template>\r\n<ng-template #defaultInactiveNormalEventSectionTemplate>\r\n</ng-template>\r\n\r\n<div [ngSwitch]=\"calendarMode\" class=\"{{calendarMode}}view-container\">\r\n    <monthview *ngSwitchCase=\"'month'\" [formatDay]=\"formatDay\" [formatDayHeader]=\"formatDayHeader\"\r\n        [formatMonthTitle]=\"formatMonthTitle\" [startingDayMonth]=\"startingDayMonth\" [showEventDetail]=\"showEventDetail\"\r\n        [noEventsLabel]=\"noEventsLabel\" [autoSelect]=\"autoSelect\" [eventSource]=\"eventSource\"\r\n        [markDisabled]=\"markDisabled\"\r\n        [monthviewDisplayEventTemplate]=\"monthviewDisplayEventTemplate||monthviewDefaultDisplayEventTemplate\"\r\n        [monthviewInactiveDisplayEventTemplate]=\"monthviewInactiveDisplayEventTemplate||monthviewDefaultDisplayEventTemplate\"\r\n        [monthviewEventDetailTemplate]=\"monthviewEventDetailTemplate||monthviewDefaultEventDetailTemplate\"\r\n        [locale]=\"locale\" [dateFormatter]=\"dateFormatter\" [dir]=\"dir\" [lockSwipeToPrev]=\"lockSwipeToPrev\"\r\n        [lockSwipeToNext]=\"lockSwipeToNext\" [lockSwipes]=\"lockSwipes\" [sliderOptions]=\"sliderOptions\"\r\n        (onRangeChanged)=\"rangeChanged($event)\" (onEventSelected)=\"eventSelected($event)\"\r\n        (onTimeSelected)=\"timeSelected($event)\" (onTitleChanged)=\"titleChanged($event)\">\r\n    </monthview>\r\n    <weekview *ngSwitchCase=\"'week'\" [formatWeekTitle]=\"formatWeekTitle\"\r\n        [formatWeekViewDayHeader]=\"formatWeekViewDayHeader\" [formatHourColumn]=\"formatHourColumn\"\r\n        [startingDayWeek]=\"startingDayWeek\" [allDayLabel]=\"allDayLabel\" [hourParts]=\"hourParts\"\r\n        [autoSelect]=\"autoSelect\" [hourSegments]=\"hourSegments\" [eventSource]=\"eventSource\"\r\n        [markDisabled]=\"markDisabled\" [weekviewHeaderTemplate]=\"weekviewHeaderTemplate||defaultWeekviewHeaderTemplate\"\r\n        [weekviewAllDayEventTemplate]=\"weekviewAllDayEventTemplate||defaultAllDayEventTemplate\"\r\n        [weekviewNormalEventTemplate]=\"weekviewNormalEventTemplate||defaultNormalEventTemplate\"\r\n        [weekviewAllDayEventSectionTemplate]=\"weekviewAllDayEventSectionTemplate||defaultWeekViewAllDayEventSectionTemplate\"\r\n        [weekviewNormalEventSectionTemplate]=\"weekviewNormalEventSectionTemplate||defaultNormalEventSectionTemplate\"\r\n        [weekviewInactiveAllDayEventSectionTemplate]=\"weekviewInactiveAllDayEventSectionTemplate||defaultInactiveAllDayEventSectionTemplate\"\r\n        [weekviewInactiveNormalEventSectionTemplate]=\"weekviewInactiveNormalEventSectionTemplate||defaultInactiveNormalEventSectionTemplate\"\r\n        [locale]=\"locale\" [dateFormatter]=\"dateFormatter\" [dir]=\"dir\" [scrollToHour]=\"scrollToHour\"\r\n        [preserveScrollPosition]=\"preserveScrollPosition\" [lockSwipeToPrev]=\"lockSwipeToPrev\"\r\n        [lockSwipeToNext]=\"lockSwipeToNext\" [lockSwipes]=\"lockSwipes\" [startHour]=\"startHour\" [endHour]=\"endHour\"\r\n        [sliderOptions]=\"sliderOptions\" (onRangeChanged)=\"rangeChanged($event)\"\r\n        (onEventSelected)=\"eventSelected($event)\" (onDayHeaderSelected)=\"daySelected($event)\"\r\n        (onTimeSelected)=\"timeSelected($event)\" (onTitleChanged)=\"titleChanged($event)\">\r\n    </weekview>\r\n    <dayview *ngSwitchCase=\"'day'\" [formatDayTitle]=\"formatDayTitle\" [formatHourColumn]=\"formatHourColumn\"\r\n        [allDayLabel]=\"allDayLabel\" [hourParts]=\"hourParts\" [hourSegments]=\"hourSegments\" [eventSource]=\"eventSource\"\r\n        [markDisabled]=\"markDisabled\"\r\n        [dayviewCategoryItemTemplate]=\"dayviewCategoryItemTemplate||defaultCategoryItemTemplate\"\r\n        [dayviewAllDayEventTemplate]=\"dayviewAllDayEventTemplate||defaultAllDayEventTemplate\"\r\n        [dayviewNormalEventTemplate]=\"dayviewNormalEventTemplate||defaultNormalEventTemplate\"\r\n        [dayviewAllDayEventSectionTemplate]=\"dayviewAllDayEventSectionTemplate||defaultDayViewAllDayEventSectionTemplate\"\r\n        [dayviewNormalEventSectionTemplate]=\"dayviewNormalEventSectionTemplate||defaultNormalEventSectionTemplate\"\r\n        [dayviewInactiveAllDayEventSectionTemplate]=\"dayviewInactiveAllDayEventSectionTemplate||defaultInactiveAllDayEventSectionTemplate\"\r\n        [dayviewInactiveNormalEventSectionTemplate]=\"dayviewInactiveNormalEventSectionTemplate||defaultInactiveNormalEventSectionTemplate\"\r\n        [locale]=\"locale\" [dateFormatter]=\"dateFormatter\" [dir]=\"dir\" [scrollToHour]=\"scrollToHour\"\r\n        [preserveScrollPosition]=\"preserveScrollPosition\" [lockSwipeToPrev]=\"lockSwipeToPrev\"\r\n        [lockSwipeToNext]=\"lockSwipeToNext\" [lockSwipes]=\"lockSwipes\" [startHour]=\"startHour\" [endHour]=\"endHour\"\r\n        [sliderOptions]=\"sliderOptions\" (onRangeChanged)=\"rangeChanged($event)\"\r\n        [dayviewCategorySource]=\"dayviewCategorySource\"\r\n        [dayviewShowCategoryView]=\"dayviewShowCategoryView\"\r\n        (onEventSelected)=\"eventSelected($event)\" (onTimeSelected)=\"timeSelected($event)\"\r\n        (onTitleChanged)=\"titleChanged($event)\">\r\n    </dayview>\r\n</div>", styles: [":host>div{height:100%}.event-detail-container{border-top:2px darkgrey solid}.no-events-label{font-weight:700;color:#a9a9a9;text-align:center}.event-detail{cursor:pointer;white-space:nowrap;text-overflow:ellipsis}.event-category-detail{margin-left:10px}.monthview-eventdetail-timecolumn{width:110px;overflow:hidden}.calendar-event-inner{overflow:hidden;background-color:#3a87ad;color:#fff;height:100%;width:100%;padding:2px;line-height:15px;text-align:initial}@media(max-width:750px){.calendar-event-inner{font-size:12px}}\n"], dependencies: [{ kind: "component", type: i2$1.IonItem, selector: "ion-item", inputs: ["button", "color", "detail", "detailIcon", "disabled", "download", "href", "lines", "mode", "rel", "routerAnimation", "routerDirection", "target", "type"] }, { kind: "component", type: i2$1.IonList, selector: "ion-list", inputs: ["inset", "lines", "mode"] }, { kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i2.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i2.NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: i2.NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "component", type: MonthViewComponent, selector: "monthview", inputs: ["monthviewDisplayEventTemplate", "monthviewInactiveDisplayEventTemplate", "monthviewEventDetailTemplate", "formatDay", "formatDayHeader", "formatMonthTitle", "eventSource", "startingDayMonth", "showEventDetail", "noEventsLabel", "autoSelect", "markDisabled", "locale", "dateFormatter", "dir", "lockSwipeToPrev", "lockSwipeToNext", "lockSwipes", "sliderOptions"], outputs: ["onRangeChanged", "onEventSelected", "onTimeSelected", "onTitleChanged"] }, { kind: "component", type: WeekViewComponent, selector: "weekview", inputs: ["weekviewHeaderTemplate", "weekviewAllDayEventTemplate", "weekviewNormalEventTemplate", "weekviewAllDayEventSectionTemplate", "weekviewNormalEventSectionTemplate", "weekviewInactiveAllDayEventSectionTemplate", "weekviewInactiveNormalEventSectionTemplate", "formatWeekTitle", "formatWeekViewDayHeader", "formatHourColumn", "startingDayWeek", "allDayLabel", "hourParts", "eventSource", "autoSelect", "markDisabled", "locale", "dateFormatter", "dir", "scrollToHour", "preserveScrollPosition", "lockSwipeToPrev", "lockSwipeToNext", "lockSwipes", "startHour", "endHour", "sliderOptions", "hourSegments"], outputs: ["onRangeChanged", "onEventSelected", "onTimeSelected", "onDayHeaderSelected", "onTitleChanged"] }, { kind: "component", type: DayViewComponent, selector: "dayview", inputs: ["dayviewCategoryItemTemplate", "dayviewAllDayEventTemplate", "dayviewNormalEventTemplate", "dayviewAllDayEventSectionTemplate", "dayviewNormalEventSectionTemplate", "dayviewInactiveAllDayEventSectionTemplate", "dayviewInactiveNormalEventSectionTemplate", "formatHourColumn", "formatDayTitle", "allDayLabel", "hourParts", "eventSource", "markDisabled", "locale", "dateFormatter", "dir", "scrollToHour", "preserveScrollPosition", "lockSwipeToPrev", "lockSwipeToNext", "lockSwipes", "startHour", "endHour", "sliderOptions", "hourSegments", "dayviewCategorySource", "dayviewShowCategoryView"], outputs: ["onRangeChanged", "onEventSelected", "onTimeSelected", "onTitleChanged"] }, { kind: "pipe", type: i2.DatePipe, name: "date" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: CalendarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'calendar', providers: [CalendarService], standalone: false, template: "<ng-template #monthviewDefaultDisplayEventTemplate let-view=\"view\" let-row=\"row\" let-col=\"col\">\r\n    {{view.dates[row*7+col].label}}\r\n</ng-template>\r\n<ng-template #monthviewDefaultEventDetailTemplate let-showEventDetail=\"showEventDetail\" let-selectedDate=\"selectedDate\"\r\n    let-noEventsLabel=\"noEventsLabel\">\r\n    <ion-list class=\"event-detail-container\" has-bouncing=\"false\" *ngIf=\"showEventDetail\" overflow-scroll=\"false\">\r\n        <ion-item *ngFor=\"let event of selectedDate?.events\" (click)=\"eventSelected(event)\">\r\n            <span *ngIf=\"!event.allDay\" class=\"monthview-eventdetail-timecolumn\">{{event.startTime|date: 'HH:mm'}}\r\n                -\r\n                {{event.endTime|date: 'HH:mm'}}\r\n            </span>\r\n            <span *ngIf=\"event.allDay\" class=\"monthview-eventdetail-timecolumn\">{{allDayLabel}}</span>\r\n            <span class=\"event-detail\"> | {{event.title}} </span>\r\n            <span class=\"event-detail event-category-detail\" *ngIf=\"event.categoryId\">[{{event.categoryName}}]</span>\r\n        </ion-item>\r\n        <ion-item *ngIf=\"selectedDate?.events.length==0\">\r\n            <div class=\"no-events-label\">{{noEventsLabel}}</div>\r\n        </ion-item>\r\n    </ion-list>\r\n</ng-template>\r\n<ng-template #defaultWeekviewHeaderTemplate let-viewDate=\"viewDate\">\r\n    {{ viewDate.dayHeader }}\r\n</ng-template>\r\n<ng-template #defaultCategoryItemTemplate let-category=\"category\">\r\n    {{ category }}\r\n</ng-template>\r\n<ng-template #defaultAllDayEventTemplate let-displayEvent=\"displayEvent\">\r\n    <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>\r\n</ng-template>\r\n<ng-template #defaultNormalEventTemplate let-displayEvent=\"displayEvent\">\r\n    <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>\r\n</ng-template>\r\n<ng-template #defaultWeekViewAllDayEventSectionTemplate let-day=\"day\" let-eventTemplate=\"eventTemplate\">\r\n    <div [ngClass]=\"{'calendar-event-wrap': day.events}\" *ngIf=\"day.events\"\r\n        [ngStyle]=\"{height: 25*day.events.length+'px'}\">\r\n        <div *ngFor=\"let displayEvent of day.events\" class=\"calendar-event\" tappable\r\n            (click)=\"eventSelected(displayEvent.event)\"\r\n            [ngStyle]=\"{top: 25*displayEvent.position+'px', width: 100*(displayEvent.endIndex-displayEvent.startIndex)+'%', height: '25px'}\">\r\n            <ng-template [ngTemplateOutlet]=\"eventTemplate\" [ngTemplateOutletContext]=\"{displayEvent:displayEvent}\">\r\n            </ng-template>\r\n        </div>\r\n    </div>\r\n</ng-template>\r\n<ng-template #defaultDayViewAllDayEventSectionTemplate let-allDayEvents=\"allDayEvents\"\r\n    let-eventTemplate=\"eventTemplate\">\r\n    <div *ngFor=\"let displayEvent of allDayEvents; let eventIndex=index\" class=\"calendar-event\" tappable\r\n        (click)=\"eventSelected(displayEvent.event)\" [ngStyle]=\"{top: 25*eventIndex+'px',width: '100%',height:'25px'}\">\r\n        <ng-template [ngTemplateOutlet]=\"eventTemplate\" [ngTemplateOutletContext]=\"{displayEvent:displayEvent}\">\r\n        </ng-template>\r\n    </div>\r\n</ng-template>\r\n<ng-template #defaultNormalEventSectionTemplate let-tm=\"tm\" let-hourParts=\"hourParts\" let-eventTemplate=\"eventTemplate\">\r\n    <div [ngClass]=\"{'calendar-event-wrap': tm.events}\" *ngIf=\"tm.events\">\r\n        <div *ngFor=\"let displayEvent of tm.events\" class=\"calendar-event\" tappable\r\n            (click)=\"eventSelected(displayEvent.event)\"\r\n            [ngStyle]=\"{top: (37*displayEvent.startOffset/hourParts)+'px',left: 100/displayEvent.overlapNumber*displayEvent.position+'%', width: 100/displayEvent.overlapNumber+'%', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+'px'}\">\r\n            <ng-template [ngTemplateOutlet]=\"eventTemplate\" [ngTemplateOutletContext]=\"{displayEvent:displayEvent}\">\r\n            </ng-template>\r\n        </div>\r\n    </div>\r\n</ng-template>\r\n<ng-template #defaultInactiveAllDayEventSectionTemplate>\r\n</ng-template>\r\n<ng-template #defaultInactiveNormalEventSectionTemplate>\r\n</ng-template>\r\n\r\n<div [ngSwitch]=\"calendarMode\" class=\"{{calendarMode}}view-container\">\r\n    <monthview *ngSwitchCase=\"'month'\" [formatDay]=\"formatDay\" [formatDayHeader]=\"formatDayHeader\"\r\n        [formatMonthTitle]=\"formatMonthTitle\" [startingDayMonth]=\"startingDayMonth\" [showEventDetail]=\"showEventDetail\"\r\n        [noEventsLabel]=\"noEventsLabel\" [autoSelect]=\"autoSelect\" [eventSource]=\"eventSource\"\r\n        [markDisabled]=\"markDisabled\"\r\n        [monthviewDisplayEventTemplate]=\"monthviewDisplayEventTemplate||monthviewDefaultDisplayEventTemplate\"\r\n        [monthviewInactiveDisplayEventTemplate]=\"monthviewInactiveDisplayEventTemplate||monthviewDefaultDisplayEventTemplate\"\r\n        [monthviewEventDetailTemplate]=\"monthviewEventDetailTemplate||monthviewDefaultEventDetailTemplate\"\r\n        [locale]=\"locale\" [dateFormatter]=\"dateFormatter\" [dir]=\"dir\" [lockSwipeToPrev]=\"lockSwipeToPrev\"\r\n        [lockSwipeToNext]=\"lockSwipeToNext\" [lockSwipes]=\"lockSwipes\" [sliderOptions]=\"sliderOptions\"\r\n        (onRangeChanged)=\"rangeChanged($event)\" (onEventSelected)=\"eventSelected($event)\"\r\n        (onTimeSelected)=\"timeSelected($event)\" (onTitleChanged)=\"titleChanged($event)\">\r\n    </monthview>\r\n    <weekview *ngSwitchCase=\"'week'\" [formatWeekTitle]=\"formatWeekTitle\"\r\n        [formatWeekViewDayHeader]=\"formatWeekViewDayHeader\" [formatHourColumn]=\"formatHourColumn\"\r\n        [startingDayWeek]=\"startingDayWeek\" [allDayLabel]=\"allDayLabel\" [hourParts]=\"hourParts\"\r\n        [autoSelect]=\"autoSelect\" [hourSegments]=\"hourSegments\" [eventSource]=\"eventSource\"\r\n        [markDisabled]=\"markDisabled\" [weekviewHeaderTemplate]=\"weekviewHeaderTemplate||defaultWeekviewHeaderTemplate\"\r\n        [weekviewAllDayEventTemplate]=\"weekviewAllDayEventTemplate||defaultAllDayEventTemplate\"\r\n        [weekviewNormalEventTemplate]=\"weekviewNormalEventTemplate||defaultNormalEventTemplate\"\r\n        [weekviewAllDayEventSectionTemplate]=\"weekviewAllDayEventSectionTemplate||defaultWeekViewAllDayEventSectionTemplate\"\r\n        [weekviewNormalEventSectionTemplate]=\"weekviewNormalEventSectionTemplate||defaultNormalEventSectionTemplate\"\r\n        [weekviewInactiveAllDayEventSectionTemplate]=\"weekviewInactiveAllDayEventSectionTemplate||defaultInactiveAllDayEventSectionTemplate\"\r\n        [weekviewInactiveNormalEventSectionTemplate]=\"weekviewInactiveNormalEventSectionTemplate||defaultInactiveNormalEventSectionTemplate\"\r\n        [locale]=\"locale\" [dateFormatter]=\"dateFormatter\" [dir]=\"dir\" [scrollToHour]=\"scrollToHour\"\r\n        [preserveScrollPosition]=\"preserveScrollPosition\" [lockSwipeToPrev]=\"lockSwipeToPrev\"\r\n        [lockSwipeToNext]=\"lockSwipeToNext\" [lockSwipes]=\"lockSwipes\" [startHour]=\"startHour\" [endHour]=\"endHour\"\r\n        [sliderOptions]=\"sliderOptions\" (onRangeChanged)=\"rangeChanged($event)\"\r\n        (onEventSelected)=\"eventSelected($event)\" (onDayHeaderSelected)=\"daySelected($event)\"\r\n        (onTimeSelected)=\"timeSelected($event)\" (onTitleChanged)=\"titleChanged($event)\">\r\n    </weekview>\r\n    <dayview *ngSwitchCase=\"'day'\" [formatDayTitle]=\"formatDayTitle\" [formatHourColumn]=\"formatHourColumn\"\r\n        [allDayLabel]=\"allDayLabel\" [hourParts]=\"hourParts\" [hourSegments]=\"hourSegments\" [eventSource]=\"eventSource\"\r\n        [markDisabled]=\"markDisabled\"\r\n        [dayviewCategoryItemTemplate]=\"dayviewCategoryItemTemplate||defaultCategoryItemTemplate\"\r\n        [dayviewAllDayEventTemplate]=\"dayviewAllDayEventTemplate||defaultAllDayEventTemplate\"\r\n        [dayviewNormalEventTemplate]=\"dayviewNormalEventTemplate||defaultNormalEventTemplate\"\r\n        [dayviewAllDayEventSectionTemplate]=\"dayviewAllDayEventSectionTemplate||defaultDayViewAllDayEventSectionTemplate\"\r\n        [dayviewNormalEventSectionTemplate]=\"dayviewNormalEventSectionTemplate||defaultNormalEventSectionTemplate\"\r\n        [dayviewInactiveAllDayEventSectionTemplate]=\"dayviewInactiveAllDayEventSectionTemplate||defaultInactiveAllDayEventSectionTemplate\"\r\n        [dayviewInactiveNormalEventSectionTemplate]=\"dayviewInactiveNormalEventSectionTemplate||defaultInactiveNormalEventSectionTemplate\"\r\n        [locale]=\"locale\" [dateFormatter]=\"dateFormatter\" [dir]=\"dir\" [scrollToHour]=\"scrollToHour\"\r\n        [preserveScrollPosition]=\"preserveScrollPosition\" [lockSwipeToPrev]=\"lockSwipeToPrev\"\r\n        [lockSwipeToNext]=\"lockSwipeToNext\" [lockSwipes]=\"lockSwipes\" [startHour]=\"startHour\" [endHour]=\"endHour\"\r\n        [sliderOptions]=\"sliderOptions\" (onRangeChanged)=\"rangeChanged($event)\"\r\n        [dayviewCategorySource]=\"dayviewCategorySource\"\r\n        [dayviewShowCategoryView]=\"dayviewShowCategoryView\"\r\n        (onEventSelected)=\"eventSelected($event)\" (onTimeSelected)=\"timeSelected($event)\"\r\n        (onTitleChanged)=\"titleChanged($event)\">\r\n    </dayview>\r\n</div>", styles: [":host>div{height:100%}.event-detail-container{border-top:2px darkgrey solid}.no-events-label{font-weight:700;color:#a9a9a9;text-align:center}.event-detail{cursor:pointer;white-space:nowrap;text-overflow:ellipsis}.event-category-detail{margin-left:10px}.monthview-eventdetail-timecolumn{width:110px;overflow:hidden}.calendar-event-inner{overflow:hidden;background-color:#3a87ad;color:#fff;height:100%;width:100%;padding:2px;line-height:15px;text-align:initial}@media(max-width:750px){.calendar-event-inner{font-size:12px}}\n"] }]
        }], ctorParameters: () => [{ type: CalendarService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }, { type: i0.NgZone }], propDecorators: { currentDate: [{
                type: Input
            }], eventSource: [{
                type: Input
            }], calendarMode: [{
                type: Input
            }], formatDay: [{
                type: Input
            }], formatDayHeader: [{
                type: Input
            }], formatDayTitle: [{
                type: Input
            }], formatWeekTitle: [{
                type: Input
            }], formatMonthTitle: [{
                type: Input
            }], formatWeekViewDayHeader: [{
                type: Input
            }], formatHourColumn: [{
                type: Input
            }], showEventDetail: [{
                type: Input
            }], startingDayMonth: [{
                type: Input
            }], startingDayWeek: [{
                type: Input
            }], allDayLabel: [{
                type: Input
            }], noEventsLabel: [{
                type: Input
            }], queryMode: [{
                type: Input
            }], step: [{
                type: Input
            }], timeInterval: [{
                type: Input
            }], autoSelect: [{
                type: Input
            }], markDisabled: [{
                type: Input
            }], monthviewDisplayEventTemplate: [{
                type: Input
            }], monthviewInactiveDisplayEventTemplate: [{
                type: Input
            }], monthviewEventDetailTemplate: [{
                type: Input
            }], weekviewHeaderTemplate: [{
                type: Input
            }], weekviewAllDayEventTemplate: [{
                type: Input
            }], weekviewNormalEventTemplate: [{
                type: Input
            }], dayviewCategoryItemTemplate: [{
                type: Input
            }], dayviewAllDayEventTemplate: [{
                type: Input
            }], dayviewNormalEventTemplate: [{
                type: Input
            }], weekviewAllDayEventSectionTemplate: [{
                type: Input
            }], weekviewNormalEventSectionTemplate: [{
                type: Input
            }], dayviewAllDayEventSectionTemplate: [{
                type: Input
            }], dayviewNormalEventSectionTemplate: [{
                type: Input
            }], weekviewInactiveAllDayEventSectionTemplate: [{
                type: Input
            }], weekviewInactiveNormalEventSectionTemplate: [{
                type: Input
            }], dayviewInactiveAllDayEventSectionTemplate: [{
                type: Input
            }], dayviewInactiveNormalEventSectionTemplate: [{
                type: Input
            }], dateFormatter: [{
                type: Input
            }], dir: [{
                type: Input
            }], scrollToHour: [{
                type: Input
            }], preserveScrollPosition: [{
                type: Input
            }], lockSwipeToPrev: [{
                type: Input
            }], lockSwipeToNext: [{
                type: Input
            }], lockSwipes: [{
                type: Input
            }], locale: [{
                type: Input
            }], startHour: [{
                type: Input
            }], endHour: [{
                type: Input
            }], sliderOptions: [{
                type: Input
            }], dayviewCategorySource: [{
                type: Input
            }], dayviewShowCategoryView: [{
                type: Input
            }], onCurrentDateChanged: [{
                type: Output
            }], onRangeChanged: [{
                type: Output
            }], onEventSelected: [{
                type: Output
            }], onTimeSelected: [{
                type: Output
            }], onDayHeaderSelected: [{
                type: Output
            }], onTitleChanged: [{
                type: Output
            }] } });

class NgCalendarModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: NgCalendarModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "21.2.25", ngImport: i0, type: NgCalendarModule, declarations: [MonthViewComponent, WeekViewComponent, DayViewComponent, CalendarComponent, initPositionScrollComponent], imports: [IonicModule, CommonModule], exports: [CalendarComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: NgCalendarModule, imports: [IonicModule, CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.25", ngImport: i0, type: NgCalendarModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        MonthViewComponent, WeekViewComponent, DayViewComponent, CalendarComponent, initPositionScrollComponent
                    ],
                    imports: [IonicModule, CommonModule],
                    exports: [CalendarComponent]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CalendarComponent, NgCalendarModule, Step };
//# sourceMappingURL=ionic7-calendar-17.mjs.map
