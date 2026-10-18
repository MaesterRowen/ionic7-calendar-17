import * as i0 from '@angular/core';
import { TemplateRef, EventEmitter, OnInit, OnDestroy, OnChanges, AfterViewInit, NgZone, ElementRef, SimpleChanges } from '@angular/core';
import { SwiperOptions } from 'swiper/types';
import { Observable } from 'rxjs';
import * as i6 from '@ionic/angular';
import * as i7 from '@angular/common';

interface IEvent {
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    category?: string;
}
interface IRange {
    startTime: Date;
    endTime: Date;
}
interface IView {
}
interface IDayView extends IView {
    allDayEvents: IDisplayAllDayEvent[];
    rows: IDayViewRow[];
    categorizedAllDayEventsMap: Map<string, IDisplayAllDayEvent[]>;
}
/**
 * should be renamed to IDayViewCell since row could be vertically sliced into pieces of categories
 */
interface IDayViewRow {
    events: IDisplayEvent[];
    eventsGroupByCategory?: Map<string, IDisplayEvent[]>;
    time: Date;
}
interface IMonthView extends IView {
    dates: IMonthViewRow[];
    dayHeaders: string[];
}
interface IMonthViewRow {
    current?: boolean;
    date: Date;
    events: IEvent[];
    hasEvent?: boolean;
    label: string;
    secondary: boolean;
    selected?: boolean;
    disabled: boolean;
}
interface IWeekView extends IView {
    dates: IWeekViewDateRow[];
    rows: IWeekViewRow[][];
}
interface IWeekViewDateRow {
    current?: boolean;
    date: Date;
    events: IDisplayEvent[];
    hasEvent?: boolean;
    selected?: boolean;
    dayHeader: string;
}
interface IWeekViewRow {
    events: IDisplayEvent[];
    time: Date;
}
interface IDisplayEvent {
    endIndex: number;
    endOffset: number;
    event: IEvent;
    startIndex: number;
    startOffset: number;
    overlapNumber?: number;
    position: number;
}
interface IDisplayWeekViewHeader {
    viewDate: IWeekViewDateRow;
}
interface IDisplayAllDayEvent {
    event: IEvent;
}
interface ICalendarComponent {
    currentViewIndex: number;
    direction: number;
    eventSource: IEvent[];
    getRange: {
        (date: Date): IRange;
    };
    getViewData: {
        (date: Date): IView;
    };
    mode: CalendarMode;
    range: IRange;
    views: IView[];
    onDataLoaded: {
        (): void;
    };
    onRangeChanged: EventEmitter<IRange>;
}
interface ITimeSelected {
    events: IEvent[];
    selectedTime: Date;
    disabled: boolean;
    category?: string;
}
interface IMonthViewDisplayEventTemplateContext {
    view?: IView;
    row?: number;
    col?: number;
    showEventDetail?: boolean;
    selectedDate?: IMonthViewRow;
    noEventsLabel?: string;
}
interface IMonthViewEventDetailTemplateContext {
    selectedDate: ITimeSelected;
    noEventsLabel: string;
}
interface IWeekViewAllDayEventSectionTemplateContext {
    day: IWeekViewDateRow;
    eventTemplate?: TemplateRef<IDisplayAllDayEvent>;
}
interface IWeekViewNormalEventSectionTemplateContext {
    tm: IWeekViewRow;
    eventTemplate?: TemplateRef<IDisplayEvent>;
    hourParts?: number;
}
interface IDayViewAllDayEventSectionTemplateContext {
    allDayEvents: IDisplayAllDayEvent[];
    eventTemplate?: TemplateRef<IDisplayAllDayEvent>;
}
interface IDayViewNormalEventSectionTemplateContext {
    tm: IDayViewRow;
    eventTemplate?: TemplateRef<IDisplayEvent>;
    hourParts?: number;
    category?: string;
}
interface IDayViewCategoryItemTemplateContext {
    category: string;
}
interface IDateFormatter {
    formatMonthViewDay?: {
        (date: Date): string;
    };
    formatMonthViewDayHeader?: {
        (date: Date): string;
    };
    formatMonthViewTitle?: {
        (date: Date): string;
    };
    formatWeekViewDayHeader?: {
        (date: Date): string;
    };
    formatWeekViewTitle?: {
        (date: Date): string;
    };
    formatWeekViewHourColumn?: {
        (date: Date): string;
    };
    formatDayViewTitle?: {
        (date: Date): string;
    };
    formatDayViewHourColumn?: {
        (date: Date): string;
    };
}
type CalendarMode = 'day' | 'month' | 'week';
type QueryMode = 'local' | 'remote';
declare enum Step {
    QuarterHour = 15,
    HalfHour = 30,
    Hour = 60
}

declare class CalendarService {
    queryMode: QueryMode;
    currentDateChangedFromParent$: Observable<Date>;
    currentDateChangedFromChildren$: Observable<Date>;
    eventSourceChanged$: Observable<void>;
    slideChanged$: Observable<number>;
    slideUpdated$: Observable<void>;
    private _currentDate;
    private currentDateChangedFromParent;
    private currentDateChangedFromChildren;
    private eventSourceChanged;
    private slideChanged;
    private slideUpdated;
    constructor();
    setCurrentDate(val: Date, fromParent?: boolean): void;
    get currentDate(): Date;
    rangeChanged(component: ICalendarComponent): void;
    private getStep;
    getAdjacentCalendarDate(mode: CalendarMode, direction: number): Date;
    getAdjacentViewStartTime(component: ICalendarComponent, direction: number): Date;
    populateAdjacentViews(component: ICalendarComponent): void;
    loadEvents(): void;
    slide(direction: number): void;
    update(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CalendarService>;
}

declare class MonthViewComponent implements ICalendarComponent, OnInit, OnDestroy, OnChanges, AfterViewInit {
    private calendarService;
    private zone;
    constructor(calendarService: CalendarService, zone: NgZone);
    private slider;
    swiperElement?: ElementRef;
    monthviewDisplayEventTemplate: TemplateRef<IMonthViewDisplayEventTemplateContext>;
    monthviewInactiveDisplayEventTemplate: TemplateRef<IMonthViewDisplayEventTemplateContext>;
    monthviewEventDetailTemplate: TemplateRef<IMonthViewDisplayEventTemplateContext>;
    formatDay?: string;
    formatDayHeader?: string;
    formatMonthTitle?: string;
    eventSource: IEvent[];
    startingDayMonth: number;
    showEventDetail?: boolean;
    noEventsLabel?: string;
    autoSelect: boolean;
    markDisabled?: (date: Date) => boolean;
    locale: string;
    dateFormatter?: IDateFormatter;
    dir: string;
    lockSwipeToPrev?: boolean;
    lockSwipeToNext?: boolean;
    lockSwipes?: boolean;
    sliderOptions?: SwiperOptions;
    onRangeChanged: EventEmitter<IRange>;
    onEventSelected: EventEmitter<IEvent>;
    onTimeSelected: EventEmitter<ITimeSelected>;
    onTitleChanged: EventEmitter<string>;
    views: IMonthView[];
    currentViewIndex: number;
    selectedDate?: IMonthViewRow;
    range: IRange;
    mode: CalendarMode;
    direction: number;
    private moveOnSelected;
    private inited;
    private currentDateChangedFromParentSubscription?;
    private eventSourceChangedSubscription?;
    private slideChangedSubscription?;
    private slideUpdatedSubscription?;
    private formatDayLabel;
    private formatDayHeaderLabel;
    private formatTitle;
    static getDates(startDate: Date, n: number): Date[];
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    setSwiperInstance(swiper: any): void;
    onSlideChanged(direction: number): void;
    move(direction: number): void;
    createDateObject(date: Date): IMonthViewRow;
    getViewData(startTime: Date): IMonthView;
    getHighlightClass(date: IMonthViewRow): string;
    getRange(currentDate: Date): IRange;
    onDataLoaded(): void;
    refreshView(): void;
    getTitle(): string;
    private compareEvent;
    select(viewDate: IMonthViewRow): void;
    slideView(direction: number): void;
    updateCurrentView(currentViewStartDate: Date, view: IMonthView): void;
    eventSelected(event: IEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonthViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MonthViewComponent, "monthview", never, { "monthviewDisplayEventTemplate": { "alias": "monthviewDisplayEventTemplate"; "required": false; }; "monthviewInactiveDisplayEventTemplate": { "alias": "monthviewInactiveDisplayEventTemplate"; "required": false; }; "monthviewEventDetailTemplate": { "alias": "monthviewEventDetailTemplate"; "required": false; }; "formatDay": { "alias": "formatDay"; "required": false; }; "formatDayHeader": { "alias": "formatDayHeader"; "required": false; }; "formatMonthTitle": { "alias": "formatMonthTitle"; "required": false; }; "eventSource": { "alias": "eventSource"; "required": false; }; "startingDayMonth": { "alias": "startingDayMonth"; "required": false; }; "showEventDetail": { "alias": "showEventDetail"; "required": false; }; "noEventsLabel": { "alias": "noEventsLabel"; "required": false; }; "autoSelect": { "alias": "autoSelect"; "required": false; }; "markDisabled": { "alias": "markDisabled"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "dateFormatter": { "alias": "dateFormatter"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "lockSwipeToPrev": { "alias": "lockSwipeToPrev"; "required": false; }; "lockSwipeToNext": { "alias": "lockSwipeToNext"; "required": false; }; "lockSwipes": { "alias": "lockSwipes"; "required": false; }; "sliderOptions": { "alias": "sliderOptions"; "required": false; }; }, { "onRangeChanged": "onRangeChanged"; "onEventSelected": "onEventSelected"; "onTimeSelected": "onTimeSelected"; "onTitleChanged": "onTitleChanged"; }, never, never, false, never>;
}

declare class WeekViewComponent implements ICalendarComponent, OnInit, OnChanges, OnDestroy, AfterViewInit {
    private calendarService;
    private elm;
    private zone;
    constructor(calendarService: CalendarService, elm: ElementRef, zone: NgZone);
    private slider;
    swiperElement?: ElementRef;
    class: boolean;
    weekviewHeaderTemplate: TemplateRef<IDisplayWeekViewHeader>;
    weekviewAllDayEventTemplate: TemplateRef<IDisplayAllDayEvent>;
    weekviewNormalEventTemplate: TemplateRef<IDisplayEvent>;
    weekviewAllDayEventSectionTemplate: TemplateRef<IWeekViewAllDayEventSectionTemplateContext>;
    weekviewNormalEventSectionTemplate: TemplateRef<IWeekViewNormalEventSectionTemplateContext>;
    weekviewInactiveAllDayEventSectionTemplate: TemplateRef<IWeekViewAllDayEventSectionTemplateContext>;
    weekviewInactiveNormalEventSectionTemplate: TemplateRef<IWeekViewNormalEventSectionTemplateContext>;
    formatWeekTitle?: string;
    formatWeekViewDayHeader?: string;
    formatHourColumn?: string;
    startingDayWeek: number;
    allDayLabel?: string;
    hourParts: number;
    eventSource: IEvent[];
    autoSelect: boolean;
    markDisabled?: (date: Date) => boolean;
    locale: string;
    dateFormatter?: IDateFormatter;
    dir: string;
    scrollToHour: number;
    preserveScrollPosition?: boolean;
    lockSwipeToPrev?: boolean;
    lockSwipeToNext?: boolean;
    lockSwipes?: boolean;
    startHour: number;
    endHour: number;
    sliderOptions?: SwiperOptions;
    hourSegments: number;
    onRangeChanged: EventEmitter<IRange>;
    onEventSelected: EventEmitter<IEvent>;
    onTimeSelected: EventEmitter<ITimeSelected>;
    onDayHeaderSelected: EventEmitter<ITimeSelected>;
    onTitleChanged: EventEmitter<string>;
    readonly sliderIndexList: number[];
    views: IWeekView[];
    currentViewIndex: number;
    range: IRange;
    direction: number;
    mode: CalendarMode;
    private inited;
    private currentDateChangedFromParentSubscription?;
    private eventSourceChangedSubscription?;
    private slideChangedSubscription?;
    private slideUpdatedSubscription?;
    hourColumnLabels: string[];
    initScrollPosition: number;
    private formatDayHeader;
    private formatTitle;
    private formatHourColumnLabel;
    private hourRange;
    static createDateObjects(startTime: Date, startHour: number, endHour: number, timeInterval: number): IWeekViewRow[][];
    static getDates(startTime: Date, n: number): IWeekViewDateRow[];
    private static compareEventByStartOffset;
    private static calculateWidth;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    onSlideChanged(direction: number): void;
    move(direction: number): void;
    private getHourColumnLabels;
    getViewData(startTime: Date): IWeekView;
    getRange(currentDate: Date): IRange;
    onDataLoaded(): void;
    refreshView(): void;
    getTitle(): string;
    getHighlightClass(date: IWeekViewDateRow): string;
    select(selectedTime: Date, events: IDisplayEvent[]): void;
    placeEvents(orderedEvents: IDisplayEvent[]): void;
    placeAllDayEvents(orderedEvents: IDisplayEvent[]): void;
    overlap(event1: IDisplayEvent, event2: IDisplayEvent): boolean;
    calculatePosition(events: IDisplayEvent[]): void;
    updateCurrentView(currentViewStartDate: Date, view: IWeekView): void;
    daySelected(viewDate: IWeekViewDateRow): void;
    setScrollPosition(scrollPosition: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WeekViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WeekViewComponent, "weekview", never, { "weekviewHeaderTemplate": { "alias": "weekviewHeaderTemplate"; "required": false; }; "weekviewAllDayEventTemplate": { "alias": "weekviewAllDayEventTemplate"; "required": false; }; "weekviewNormalEventTemplate": { "alias": "weekviewNormalEventTemplate"; "required": false; }; "weekviewAllDayEventSectionTemplate": { "alias": "weekviewAllDayEventSectionTemplate"; "required": false; }; "weekviewNormalEventSectionTemplate": { "alias": "weekviewNormalEventSectionTemplate"; "required": false; }; "weekviewInactiveAllDayEventSectionTemplate": { "alias": "weekviewInactiveAllDayEventSectionTemplate"; "required": false; }; "weekviewInactiveNormalEventSectionTemplate": { "alias": "weekviewInactiveNormalEventSectionTemplate"; "required": false; }; "formatWeekTitle": { "alias": "formatWeekTitle"; "required": false; }; "formatWeekViewDayHeader": { "alias": "formatWeekViewDayHeader"; "required": false; }; "formatHourColumn": { "alias": "formatHourColumn"; "required": false; }; "startingDayWeek": { "alias": "startingDayWeek"; "required": false; }; "allDayLabel": { "alias": "allDayLabel"; "required": false; }; "hourParts": { "alias": "hourParts"; "required": false; }; "eventSource": { "alias": "eventSource"; "required": false; }; "autoSelect": { "alias": "autoSelect"; "required": false; }; "markDisabled": { "alias": "markDisabled"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "dateFormatter": { "alias": "dateFormatter"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "scrollToHour": { "alias": "scrollToHour"; "required": false; }; "preserveScrollPosition": { "alias": "preserveScrollPosition"; "required": false; }; "lockSwipeToPrev": { "alias": "lockSwipeToPrev"; "required": false; }; "lockSwipeToNext": { "alias": "lockSwipeToNext"; "required": false; }; "lockSwipes": { "alias": "lockSwipes"; "required": false; }; "startHour": { "alias": "startHour"; "required": false; }; "endHour": { "alias": "endHour"; "required": false; }; "sliderOptions": { "alias": "sliderOptions"; "required": false; }; "hourSegments": { "alias": "hourSegments"; "required": false; }; }, { "onRangeChanged": "onRangeChanged"; "onEventSelected": "onEventSelected"; "onTimeSelected": "onTimeSelected"; "onDayHeaderSelected": "onDayHeaderSelected"; "onTitleChanged": "onTitleChanged"; }, never, never, false, never>;
}

declare class DayViewComponent implements ICalendarComponent, OnInit, OnChanges, OnDestroy, AfterViewInit {
    private calendarService;
    private elm;
    private zone;
    constructor(calendarService: CalendarService, elm: ElementRef, zone: NgZone);
    private slider;
    swiperElement?: ElementRef;
    class: boolean;
    dayviewCategoryItemTemplate: TemplateRef<IDayViewCategoryItemTemplateContext>;
    dayviewAllDayEventTemplate: TemplateRef<IDisplayAllDayEvent>;
    dayviewNormalEventTemplate: TemplateRef<IDisplayEvent>;
    dayviewAllDayEventSectionTemplate: TemplateRef<IDayViewAllDayEventSectionTemplateContext>;
    dayviewNormalEventSectionTemplate: TemplateRef<IDayViewNormalEventSectionTemplateContext>;
    dayviewInactiveAllDayEventSectionTemplate: TemplateRef<IDayViewAllDayEventSectionTemplateContext>;
    dayviewInactiveNormalEventSectionTemplate: TemplateRef<IDayViewNormalEventSectionTemplateContext>;
    formatHourColumn?: string;
    formatDayTitle?: string;
    allDayLabel?: string;
    hourParts: number;
    eventSource: IEvent[];
    markDisabled?: (date: Date) => boolean;
    locale: string;
    dateFormatter?: IDateFormatter;
    dir: string;
    scrollToHour: number;
    preserveScrollPosition?: boolean;
    lockSwipeToPrev?: boolean;
    lockSwipeToNext?: boolean;
    lockSwipes?: boolean;
    startHour: number;
    endHour: number;
    sliderOptions?: SwiperOptions;
    hourSegments: number;
    dayviewCategorySource?: Set<string>;
    dayviewShowCategoryView?: boolean;
    onRangeChanged: EventEmitter<IRange>;
    onEventSelected: EventEmitter<IEvent>;
    onTimeSelected: EventEmitter<ITimeSelected>;
    onTitleChanged: EventEmitter<string>;
    readonly sliderIndexList: number[];
    views: IDayView[];
    currentViewIndex: number;
    direction: number;
    mode: CalendarMode;
    range: IRange;
    private inited;
    private callbackOnInit;
    private currentDateChangedFromParentSubscription?;
    private eventSourceChangedSubscription?;
    private slideChangedSubscription?;
    private slideUpdatedSubscription?;
    hourColumnLabels: string[];
    initScrollPosition: number;
    private formatTitle;
    private formatHourColumnLabel;
    private hourRange;
    static createDateObjects(startTime: Date, startHour: number, endHour: number, timeInterval: number): IDayViewRow[];
    private static compareEventByStartOffset;
    private static calculateWidth;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    onSlideChanged(direction: number): void;
    move(direction: number): void;
    private getHourColumnLabels;
    getViewData(startTime: Date): IDayView;
    getRange(currentDate: Date): IRange;
    onDataLoaded(): void;
    categorizeAllDayEvents(allDayEvents: IDisplayAllDayEvent[]): void;
    refreshView(): void;
    getTitle(): string;
    select(row: IDayViewRow, category?: string): void;
    placeEvents(orderedEvents: IDisplayEvent[]): void;
    placeAllDayEvents(orderedEvents: IDisplayEvent[]): void;
    overlap(event1: IDisplayEvent, event2: IDisplayEvent): boolean;
    calculatePosition(events: IDisplayEvent[]): void;
    eventSelected(event: IEvent): void;
    setScrollPosition(scrollPosition: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DayViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DayViewComponent, "dayview", never, { "dayviewCategoryItemTemplate": { "alias": "dayviewCategoryItemTemplate"; "required": false; }; "dayviewAllDayEventTemplate": { "alias": "dayviewAllDayEventTemplate"; "required": false; }; "dayviewNormalEventTemplate": { "alias": "dayviewNormalEventTemplate"; "required": false; }; "dayviewAllDayEventSectionTemplate": { "alias": "dayviewAllDayEventSectionTemplate"; "required": false; }; "dayviewNormalEventSectionTemplate": { "alias": "dayviewNormalEventSectionTemplate"; "required": false; }; "dayviewInactiveAllDayEventSectionTemplate": { "alias": "dayviewInactiveAllDayEventSectionTemplate"; "required": false; }; "dayviewInactiveNormalEventSectionTemplate": { "alias": "dayviewInactiveNormalEventSectionTemplate"; "required": false; }; "formatHourColumn": { "alias": "formatHourColumn"; "required": false; }; "formatDayTitle": { "alias": "formatDayTitle"; "required": false; }; "allDayLabel": { "alias": "allDayLabel"; "required": false; }; "hourParts": { "alias": "hourParts"; "required": false; }; "eventSource": { "alias": "eventSource"; "required": false; }; "markDisabled": { "alias": "markDisabled"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "dateFormatter": { "alias": "dateFormatter"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "scrollToHour": { "alias": "scrollToHour"; "required": false; }; "preserveScrollPosition": { "alias": "preserveScrollPosition"; "required": false; }; "lockSwipeToPrev": { "alias": "lockSwipeToPrev"; "required": false; }; "lockSwipeToNext": { "alias": "lockSwipeToNext"; "required": false; }; "lockSwipes": { "alias": "lockSwipes"; "required": false; }; "startHour": { "alias": "startHour"; "required": false; }; "endHour": { "alias": "endHour"; "required": false; }; "sliderOptions": { "alias": "sliderOptions"; "required": false; }; "hourSegments": { "alias": "hourSegments"; "required": false; }; "dayviewCategorySource": { "alias": "dayviewCategorySource"; "required": false; }; "dayviewShowCategoryView": { "alias": "dayviewShowCategoryView"; "required": false; }; }, { "onRangeChanged": "onRangeChanged"; "onEventSelected": "onEventSelected"; "onTimeSelected": "onTimeSelected"; "onTitleChanged": "onTitleChanged"; }, never, never, false, never>;
}

declare class CalendarComponent implements OnInit {
    private calendarService;
    private appLocale;
    private ngZone;
    get currentDate(): Date;
    set currentDate(val: Date);
    eventSource: IEvent[];
    calendarMode: CalendarMode;
    formatDay: string;
    formatDayHeader: string;
    formatDayTitle: string;
    formatWeekTitle: string;
    formatMonthTitle: string;
    formatWeekViewDayHeader: string;
    formatHourColumn: string;
    showEventDetail: boolean;
    startingDayMonth: number;
    startingDayWeek: number;
    allDayLabel: string;
    noEventsLabel: string;
    queryMode: QueryMode;
    step: Step;
    timeInterval: number;
    autoSelect: boolean;
    markDisabled?: (date: Date) => boolean;
    monthviewDisplayEventTemplate?: TemplateRef<IMonthViewDisplayEventTemplateContext>;
    monthviewInactiveDisplayEventTemplate?: TemplateRef<IMonthViewDisplayEventTemplateContext>;
    monthviewEventDetailTemplate?: TemplateRef<IMonthViewEventDetailTemplateContext>;
    weekviewHeaderTemplate?: TemplateRef<IDisplayWeekViewHeader>;
    weekviewAllDayEventTemplate?: TemplateRef<IDisplayAllDayEvent>;
    weekviewNormalEventTemplate?: TemplateRef<IDisplayEvent>;
    dayviewCategoryItemTemplate?: TemplateRef<string>;
    dayviewAllDayEventTemplate?: TemplateRef<IDisplayAllDayEvent>;
    dayviewNormalEventTemplate?: TemplateRef<IDisplayEvent>;
    weekviewAllDayEventSectionTemplate?: TemplateRef<IWeekViewAllDayEventSectionTemplateContext>;
    weekviewNormalEventSectionTemplate?: TemplateRef<IWeekViewNormalEventSectionTemplateContext>;
    dayviewAllDayEventSectionTemplate?: TemplateRef<IDayViewAllDayEventSectionTemplateContext>;
    dayviewNormalEventSectionTemplate?: TemplateRef<IDayViewNormalEventSectionTemplateContext>;
    weekviewInactiveAllDayEventSectionTemplate?: TemplateRef<IWeekViewAllDayEventSectionTemplateContext>;
    weekviewInactiveNormalEventSectionTemplate?: TemplateRef<IWeekViewNormalEventSectionTemplateContext>;
    dayviewInactiveAllDayEventSectionTemplate?: TemplateRef<IDayViewAllDayEventSectionTemplateContext>;
    dayviewInactiveNormalEventSectionTemplate?: TemplateRef<IDayViewNormalEventSectionTemplateContext>;
    dateFormatter?: IDateFormatter;
    dir: string;
    scrollToHour: number;
    preserveScrollPosition: boolean;
    lockSwipeToPrev: boolean;
    lockSwipeToNext: boolean;
    lockSwipes: boolean;
    locale: string;
    startHour: number;
    endHour: number;
    sliderOptions: any;
    dayviewCategorySource?: Set<string>;
    dayviewShowCategoryView: boolean;
    onCurrentDateChanged: EventEmitter<Date>;
    onRangeChanged: EventEmitter<IRange>;
    onEventSelected: EventEmitter<IEvent>;
    onTimeSelected: EventEmitter<ITimeSelected>;
    onDayHeaderSelected: EventEmitter<ITimeSelected>;
    onTitleChanged: EventEmitter<string>;
    private _currentDate;
    hourParts: number;
    hourSegments: number;
    private currentDateChangedFromChildrenSubscription?;
    constructor(calendarService: CalendarService, appLocale: string, ngZone: NgZone);
    ngOnInit(): void;
    ngOnDestroy(): void;
    rangeChanged(range: IRange): void;
    eventSelected(event: IEvent): void;
    timeSelected(timeSelected: ITimeSelected): void;
    daySelected(daySelected: ITimeSelected): void;
    titleChanged(title: string): void;
    loadEvents(): void;
    slideNext(): void;
    slidePrev(): void;
    update(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarComponent, "calendar", never, { "currentDate": { "alias": "currentDate"; "required": false; }; "eventSource": { "alias": "eventSource"; "required": false; }; "calendarMode": { "alias": "calendarMode"; "required": false; }; "formatDay": { "alias": "formatDay"; "required": false; }; "formatDayHeader": { "alias": "formatDayHeader"; "required": false; }; "formatDayTitle": { "alias": "formatDayTitle"; "required": false; }; "formatWeekTitle": { "alias": "formatWeekTitle"; "required": false; }; "formatMonthTitle": { "alias": "formatMonthTitle"; "required": false; }; "formatWeekViewDayHeader": { "alias": "formatWeekViewDayHeader"; "required": false; }; "formatHourColumn": { "alias": "formatHourColumn"; "required": false; }; "showEventDetail": { "alias": "showEventDetail"; "required": false; }; "startingDayMonth": { "alias": "startingDayMonth"; "required": false; }; "startingDayWeek": { "alias": "startingDayWeek"; "required": false; }; "allDayLabel": { "alias": "allDayLabel"; "required": false; }; "noEventsLabel": { "alias": "noEventsLabel"; "required": false; }; "queryMode": { "alias": "queryMode"; "required": false; }; "step": { "alias": "step"; "required": false; }; "timeInterval": { "alias": "timeInterval"; "required": false; }; "autoSelect": { "alias": "autoSelect"; "required": false; }; "markDisabled": { "alias": "markDisabled"; "required": false; }; "monthviewDisplayEventTemplate": { "alias": "monthviewDisplayEventTemplate"; "required": false; }; "monthviewInactiveDisplayEventTemplate": { "alias": "monthviewInactiveDisplayEventTemplate"; "required": false; }; "monthviewEventDetailTemplate": { "alias": "monthviewEventDetailTemplate"; "required": false; }; "weekviewHeaderTemplate": { "alias": "weekviewHeaderTemplate"; "required": false; }; "weekviewAllDayEventTemplate": { "alias": "weekviewAllDayEventTemplate"; "required": false; }; "weekviewNormalEventTemplate": { "alias": "weekviewNormalEventTemplate"; "required": false; }; "dayviewCategoryItemTemplate": { "alias": "dayviewCategoryItemTemplate"; "required": false; }; "dayviewAllDayEventTemplate": { "alias": "dayviewAllDayEventTemplate"; "required": false; }; "dayviewNormalEventTemplate": { "alias": "dayviewNormalEventTemplate"; "required": false; }; "weekviewAllDayEventSectionTemplate": { "alias": "weekviewAllDayEventSectionTemplate"; "required": false; }; "weekviewNormalEventSectionTemplate": { "alias": "weekviewNormalEventSectionTemplate"; "required": false; }; "dayviewAllDayEventSectionTemplate": { "alias": "dayviewAllDayEventSectionTemplate"; "required": false; }; "dayviewNormalEventSectionTemplate": { "alias": "dayviewNormalEventSectionTemplate"; "required": false; }; "weekviewInactiveAllDayEventSectionTemplate": { "alias": "weekviewInactiveAllDayEventSectionTemplate"; "required": false; }; "weekviewInactiveNormalEventSectionTemplate": { "alias": "weekviewInactiveNormalEventSectionTemplate"; "required": false; }; "dayviewInactiveAllDayEventSectionTemplate": { "alias": "dayviewInactiveAllDayEventSectionTemplate"; "required": false; }; "dayviewInactiveNormalEventSectionTemplate": { "alias": "dayviewInactiveNormalEventSectionTemplate"; "required": false; }; "dateFormatter": { "alias": "dateFormatter"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "scrollToHour": { "alias": "scrollToHour"; "required": false; }; "preserveScrollPosition": { "alias": "preserveScrollPosition"; "required": false; }; "lockSwipeToPrev": { "alias": "lockSwipeToPrev"; "required": false; }; "lockSwipeToNext": { "alias": "lockSwipeToNext"; "required": false; }; "lockSwipes": { "alias": "lockSwipes"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "startHour": { "alias": "startHour"; "required": false; }; "endHour": { "alias": "endHour"; "required": false; }; "sliderOptions": { "alias": "sliderOptions"; "required": false; }; "dayviewCategorySource": { "alias": "dayviewCategorySource"; "required": false; }; "dayviewShowCategoryView": { "alias": "dayviewShowCategoryView"; "required": false; }; }, { "onCurrentDateChanged": "onCurrentDateChanged"; "onRangeChanged": "onRangeChanged"; "onEventSelected": "onEventSelected"; "onTimeSelected": "onTimeSelected"; "onDayHeaderSelected": "onDayHeaderSelected"; "onTitleChanged": "onTitleChanged"; }, never, never, false, never>;
}

declare class initPositionScrollComponent implements OnChanges, AfterViewInit, OnDestroy {
    private ngZone;
    initPosition: number;
    emitEvent?: boolean;
    onScroll: EventEmitter<number>;
    private element;
    private scrollContent;
    private handler;
    private listenerAttached;
    constructor(el: ElementRef, ngZone: NgZone);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<initPositionScrollComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<initPositionScrollComponent, "init-position-scroll", never, { "initPosition": { "alias": "initPosition"; "required": false; }; "emitEvent": { "alias": "emitEvent"; "required": false; }; }, { "onScroll": "onScroll"; }, never, ["*"], false, never>;
}

declare class NgCalendarModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NgCalendarModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NgCalendarModule, [typeof MonthViewComponent, typeof WeekViewComponent, typeof DayViewComponent, typeof CalendarComponent, typeof initPositionScrollComponent], [typeof i6.IonicModule, typeof i7.CommonModule], [typeof CalendarComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NgCalendarModule>;
}

export { CalendarComponent, NgCalendarModule, Step };
export type { CalendarMode, ICalendarComponent, IDateFormatter, IDayView, IDayViewAllDayEventSectionTemplateContext, IDayViewCategoryItemTemplateContext, IDayViewNormalEventSectionTemplateContext, IDayViewRow, IDisplayAllDayEvent, IDisplayEvent, IDisplayWeekViewHeader, IEvent, IMonthView, IMonthViewDisplayEventTemplateContext, IMonthViewEventDetailTemplateContext, IMonthViewRow, IRange, ITimeSelected, IView, IWeekView, IWeekViewAllDayEventSectionTemplateContext, IWeekViewDateRow, IWeekViewNormalEventSectionTemplateContext, IWeekViewRow, QueryMode };
