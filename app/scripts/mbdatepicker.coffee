'use strict'

###*
 # By Mo Binni
###
app = angular.module('materialDatePicker', [])

contains = (container, contained) ->
  node = contained.parentNode
  while (node != null && node != container)
    node = node.parentNode
  node != null

app.directive("outsideClick", ['$document', '$parse', '$timeout', ($document, $parse, $timeout) ->
  link: ($scope, $element, $attributes) ->
    scopeExpression = $attributes.outsideClick
    onDocumentClick = (event) ->
      $timeout ->
        $scope.$eval scopeExpression unless contains($element[0], event.target)
      return
    $document.on "click", onDocumentClick
    $element.on "$destroy", ->
      $document.off "click", onDocumentClick
      return
    return
])
app.directive('mbDatepicker', ['$filter', ($filter)->
  require: ['ngModel']
  scope: {
    elementId: '@',
    dateFormat: '@'
    minDate: '@'
    maxDate: '@'
    inputClass: '@'
    inputName: '@'
    placeholder: '@'
    arrows: '=?'
    calendarHeader: '=?',
    utcMode: '=' # UTC mode can be used for fixed dates that should never be converted to local timezones (e.g., birth dates),
    ngDisabled: '=',
    label: '@',
    customInputClass: '@',
    tz: '=',
  }
  template: '
            <div id="dateSelectors" class="date-selectors"  outside-click="hidePicker()">
                    <label ng-bind="label" class="mb-input-label" for="{{inputName}}"></label>
                    <input name="{{ inputName }}" type="text" ng-disabled="{{ngDisabled}}" ng-class="{disabled: ngDisabled}" class="mb-input-field {{customInputClass}}"  ng-click="showPicker()"  class="form-control" id="{{inputName}}" placeholder="{{ placeholder }}" ng-model="innerModel" ng-change="innerChange()">
                    <div class="mb-datepicker" ng-show="isVisible">
                        <table>
                            <caption>
                              <div class="header-year-wrapper">
                                  <span style="display: inline-block; float: left; padding-left:20px; cursor: pointer" class="noselect" ng-click="previousYear(currentDate)"><i class="material-icons">chevron_left</i></span>
                                  <span class="header-year noselect" ng-class="noselect">{{ year }}</span>
                                  <span style="display: inline-block; float: right; padding-right:20px; cursor: pointer" class="noselect" ng-click="nextYear(currentDate)"><i class="material-icons">chevron_right</i></span>
                              </div>
                              <div class="header-nav-wrapper">
                                <span class="header-item noselect" style="float: left; cursor:pointer" ng-click="previousMonth(currentDate)"><i class="material-icons">chevron_left</i></span>
                                  <span class="header-month noselect">{{ month }}</span>
                                  <span class="header-item header-right noselect" style="float: right; cursor:pointer" ng-click="nextMonth(currentDate)"> <i class="material-icons">chevron_right</i></span>
                              </div>
                            </caption>
                            <tbody>
                              <tr>
                                <td class="day-head">{{ ::calendarHeader.sunday }}</td>
                                <td class="day-head">{{ ::calendarHeader.monday }}</td>
                                <td class="day-head">{{ ::calendarHeader.tuesday }}</td>
                                <td class="day-head">{{ ::calendarHeader.wednesday }}</td>
                                <td class="day-head">{{ ::calendarHeader.thursday }}</td>
                                <td class="day-head">{{ ::calendarHeader.friday }}</td>
                                <td class="day-head">{{ ::calendarHeader.saturday }}</td>
                              </tr>
                              <tr class="days" ng-repeat="week in weeks">
                                <td ng-click="selectDate(day)" class="noselect day-item" ng-repeat="day in week" ng-class="{selected: selectedDate === day.fmt, weekend: day.isWeekend, today: day.isToday, day: day.isEnabled, disabled: !day.isEnabled || day.isOtherMonth}">
                                  <div style="display: block;">
                                    {{ ::day.value }}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
'
  restrict: 'E',
  transclude: true,
  link: (scope, element, attrs, ngModel) ->
    defaultTimezone = luxon.DateTime.local().zoneName
# Vars
    selectors = element[0].querySelector('.date-selectors');
    today = luxon.DateTime.local()
    if scope.utcMode then today = today.toUTC()
    scope.month = '';
    scope.year = today.year;

    # Casual definition
    if scope.inputClass then selectors.className = selectors.className + " " + scope.inputClass
    if !scope.dateFormat then scope.dateFormat = "yyyy-MM-dd"
    if scope.minDate
      scope.minDate = luxon.DateTime.fromFormat(scope.minDate, scope.dateFormat)
      if scope.utcMode then scope.minDate = scope.minDate.toUTC()
    if scope.maxDate
      scope.maxDate = luxon.DateTime.fromFormat(scope.maxDate, scope.dateFormat)
      if scope.utcMode then scope.maxDate = scope.maxDate.toUTC()
    if !scope.calendarHeader
        days = luxon.Info.weekdays('short')
        scope.calendarHeader = {
          sunday: days[6],
          monday: days[0],
          tuesday: days[1],
          wednesday: days[2],
          thursday: days[3],
          friday: days[4],
          saturday: days[5],
        }

    # Datepicker logic to get weeks
    getWeeks = (monthLength, startDay, month) ->
      monthDays = []
      # Iterate over other dates
      if scope.minDate
        if typeof scope.minDate == 'string' then scope.minDate = luxon.DateTime.fromFormat(scope.minDate, scope.dateFormat)
        minDayCompare = scope.minDate.toFormat('yyyy-MM-dd')
      if scope.maxDate
        if typeof scope.maxDate == 'string' then scope.maxDate = luxon.DateTime.fromFormat(scope.maxDate, scope.dateFormat)
        maxDayCompare = scope.maxDate.toFormat('yyyy-MM-dd')
      nowFormat = luxon.DateTime.local({zone: getTimezone()}).toFormat('yyyy-MM-dd')
      start = startDay.startOf('day')
      for day in [0..monthLength]
        if scope.utcMode then start = start.utc()
        newDate = start.plus({days: day})
        day = {
          date: newDate,
          value: newDate.toFormat('dd'),
          fmt: newDate.toFormat('yyyy-MM-dd')
        };
        if(scope.minDate and day.fmt <= minDayCompare)
          day.isToday = true;
          day.isEnabled = false;
        else if(scope.maxDate and day.fmt >= maxDayCompare)
          day.isToday = true;
          day.isEnabled = false;
        else if day.fmt == nowFormat
          day.isToday = true;
          day.isEnabled = true;
        else if(newDate.month == month)
          day.isToday = false;
          day.isEnabled = true;
          if(newDate.weekday == 7 || newDate.weekday == 6)
            day.isWeekend = true;
        else
          day.isToday = false;
          day.isEnabled = true;
          day.isOtherMonth = true
        monthDays.push(day);

      chunk_size = 7;

      # Map reduce by 7 days per week
      weeks = monthDays.map((e, i) ->
        if i % chunk_size == 0 then monthDays.slice(i, i + chunk_size)
        else null;
      ).filter((e) ->
        return e;
      );
      if weeks then return weeks
      else return []

    changeDisplay = (to) ->
      scope.year = to.year
      last_day = to.endOf('month')
      # end of a saturday
      if (last_day.weekday < 6)
        last_day = last_day.endOf('week').plus({day: -1})
      # make sure we cover our full month!
      else if (last_day.weekday == 7)
        last_day = last_day.plus({day: 6})
      first_day = to.startOf('month').startOf('week').plus({days: -1})
      scope.currentDate = to
      scope.weeks = []
      scope.weeks = getWeeks(
        Math.floor(last_day.diff(first_day).as('day')),
        first_day,
        to.month
      )
      scope.month = to.toFormat('MMM')

    # Logic to get the following month
    scope.nextMonth = (date) ->
      changeDisplay(date.startOf('month').plus({month: 1}));

    # Logic to get the previous month
    scope.previousMonth = (date) ->
      changeDisplay(date.startOf('month').plus({month: -1}));


    # Logic to get the next year
    scope.nextYear = (date) ->
      changeDisplay(date.startOf('month').plus({year: 1}));

    # Logic to get the previous year
    scope.previousYear = (date) ->
      changeDisplay(date.startOf('month').plus({year: -1}));

    dateChanged = (to, dontSetModel) ->
      scope.selectedDate = to.toFormat('yyyy-MM-dd');
      scope.innerModel = to.toFormat(scope.dateFormat || 'yyyy-MM-dd');
      if !dontSetModel
        ngModel[0].$setViewValue(to.toFormat(scope.dateFormat || 'yyyy-MM-dd'));
      changeDisplay(to);

    getTimezone = ->
      if scope.tz
        return scope.tz
      return defaultTimezone

    # Logic to hide the view if a date is selected
    scope.selectDate = (day) ->
      if day.isEnabled
          dateChanged(day.date)
          scope.isVisible = false;

    scope.isVisible = false
    scope.showPicker = ->
      scope.isVisible = true
      selectedDate = luxon.DateTime.fromFormat(scope.innerModel, scope.dateFormat || 'yyyy-MM-dd', {zone:  getTimezone()})
      if scope.currentDate.setZone(getTimezone()).toFormat('yyyy-MM') != selectedDate.toFormat('yyyy-MM')
        changeDisplay(selectedDate.startOf('month'))
      return

    scope.hidePicker = ->
      scope.isVisible = false
      return

    init = ->
      dateChanged(luxon.DateTime.local().setZone(getTimezone()), true);
      # listen for input change
      scope.innerChange = () ->
        date = luxon.DateTime.fromFormat(scope.innerModel, scope.dateFormat || 'yyyy-MM-dd', {zone:  getTimezone()})
        if !date.isValid()
          return
        dateChanged(date)
      scope.$watch (() -> return scope.tz), (() -> ngModel[0].$render())
      # our model changed
      ngModel[0].$render = () ->
        if typeof ngModel[0].$viewValue == 'object'
            asDte = luxon.DateTime.fromJSDate(ngModel[0].$viewValue, {zone: getTimezone()})
        else
            asDte = luxon.DateTime.fromFormat(ngModel[0].$viewValue, scope.dateFormat || 'yyyy-MM-dd', {zone:  getTimezone()})
        dateChanged(asDte, true)
    init()


])
