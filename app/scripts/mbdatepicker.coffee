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
                              <tr class="days" ng-repeat="week in weeks track by week.id">
                                <td ng-click="selectDate(day)" class="noselect day-item" ng-repeat="day in week.week track by day.date" ng-class="{selected: selectedDate === day.fmt, weekend: day.isWeekend, today: day.isToday, day: day.isEnabled, disabled: !day.isEnabled}">
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
    defaultTimezone = moment.tz.guess();
# Vars
    selectors = element[0].querySelector('.date-selectors');
    today = moment()
    if scope.utcMode then today.utc()
    scope.month = '';
    scope.year = today.year();

    # Casual definition
    if scope.inputClass then selectors.className = selectors.className + " " + scope.inputClass
    if !scope.dateFormat then scope.dateFormat = "YYYY-MM-DD"
    if scope.minDate
      scope.minDate = moment(scope.minDate, scope.dateFormat)
      if scope.utcMode then scope.minDate.utc()
    if scope.maxDate
      scope.maxDate = moment(scope.maxDate, scope.dateFormat)
      if scope.utcMode then scope.maxDate.utc()
    if !scope.calendarHeader then scope.calendarHeader = {
      sunday: $filter('date')(new Date(moment().isoWeekday(7)), 'EEE'),
      monday: $filter('date')(new Date(moment().isoWeekday(1)), 'EEE'),
      tuesday: $filter('date')(new Date(moment().isoWeekday(2)), 'EEE'),
      wednesday: $filter('date')(new Date(moment().isoWeekday(3)), 'EEE'),
      thursday: $filter('date')(new Date(moment().isoWeekday(4)), 'EEE'),
      friday: $filter('date')(new Date(moment().isoWeekday(5)), 'EEE'),
      saturday: $filter('date')(new Date(moment().isoWeekday(6)), 'EEE'),
    }

    # Datepicker logic to get weeks
    getWeeks = (monthLength, startDay, month) ->
      monthDays = []
      # Iterate over other dates
      for day in [0..monthLength]
        start = moment(startDay)
        if scope.utcMode then start.utc()
        newDate = start.add(day, 'd')
        day = {
          date: newDate,
          value: newDate.format('DD'),
          fmt: newDate.format('YYYY-MM-DD')
        };
        if(scope.minDate and moment(newDate, scope.dateFormat) <= moment(scope.minDate, scope.dateFormat))
          day.isToday = true;
          day.isEnabled = false;
          monthDays.push(day);
        else if(scope.maxDate and moment(newDate, scope.dateFormat) >= moment(scope.maxDate, scope.dateFormat))
          day.isToday = true;
          day.isEnabled = false;
        else if newDate.format(scope.dateFormat) == moment().tz(getTimezone()).format(scope.dateFormat)
          day.isToday = true;
          day.isEnabled = true;
        else if(newDate.month() == month)
          day.isToday = false;
          day.isEnabled = true;
          if(newDate.day() == 0 || newDate.day() == 6)
            day.isWeekend = true;
        else
          day.isToday = false;
          day.isEnabled = false;
        monthDays.push(day);

      chunk_size = 7;

      # Map reduce by 7 days per week
      weeks = monthDays.map((e, i) ->
        if i % chunk_size == 0 then {id:'id_'+i+'_'+month,week:monthDays.slice(i, i + chunk_size)}
        else null;
      ).filter((e) ->
        return e;
      );
      if weeks then return weeks
      else return []

    changeDisplay = (to) ->
      scope.year = to.year()
      last_day = moment(to).add(1, 'month').date(0)
      if (last_day.day() != 7)
        last_day = last_day.add(6 - last_day.day(), 'days')
      first_day = moment(to).date(0).startOf('isoweek').add(-1, 'day')
      scope.currentDate = to
      scope.weeks = []
      scope.weeks = getWeeks(
        last_day.diff(first_day, 'days'),
        first_day,
        to.month()
      )
      scope.month = to.format('MMM')

    # Logic to get the following month
    scope.nextMonth = (date) ->
      changeDisplay(date.date(1).add(1, 'month'));

    # Logic to get the previous month
    scope.previousMonth = (date) ->
      changeDisplay(date.date(1).add(-1, 'month'));


    # Logic to get the next year
    scope.nextYear = (date) ->
      changeDisplay(date.date(1).add(1, 'year'));

    # Logic to get the previous year
    scope.previousYear = (date) ->
      changeDisplay(date.date(1).add(-1, 'year'));

    dateChanged = (to, dontSetModel) ->
      scope.selectedDate = to.format('YYYY-MM-DD');
      scope.innerModel = to.format(scope.dateFormat || 'YYYY-MM-DD');
      if !dontSetModel
        ngModel[0].$setViewValue(to.format(scope.dateFormat || 'YYYY-MM-DD'));
      changeDisplay(to);

    getTimezone = ->
      if scope.tz
        return scope.tz
      return defaultTimezone

    # Logic to hide the view if a date is selected
    scope.selectDate = (day) ->
      dateChanged(day.date)
      scope.isVisible = false;

    scope.isVisible = false
    scope.showPicker = ->
      scope.isVisible = true
      selectedDate = moment.tz(scope.innerModel, scope.dateFormat || 'YYYY-MM-DD', getTimezone())
      if scope.currentDate.tz(getTimezone()).format('YYYY-MM') != selectedDate.format('YYYY-MM')
        changeDisplay(selectedDate.date(1))
      return

    scope.hidePicker = ->
      scope.isVisible = false
      return

    init = ->
      dateChanged(moment().tz(getTimezone()), true);
      # listen for input change
      scope.innerChange = () ->
        date = moment.tz(scope.innerModel, scope.dateFormat || 'YYYY-MM-DD', getTimezone());
        if !date.isValid()
          return
        dateChanged(date)
      scope.$watch (() -> return scope.tz), (() -> ngModel[0].$render())
      # our model changed
      ngModel[0].$render = () ->
        dateChanged(moment.tz(ngModel[0].$viewValue, scope.dateFormat || 'YYYY-MM-DD', getTimezone()), true)
    init()


])
