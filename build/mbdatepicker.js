(function() {
  'use strict';

  /**
    * By Mo Binni
   */
  var app, contains;

  app = angular.module('materialDatePicker', []);

  contains = function(container, contained) {
    var node;
    node = contained.parentNode;
    while (node !== null && node !== container) {
      node = node.parentNode;
    }
    return node !== null;
  };

  app.directive("outsideClick", [
    '$document', '$parse', '$timeout', function($document, $parse, $timeout) {
      return {
        link: function($scope, $element, $attributes) {
          var onDocumentClick, scopeExpression;
          scopeExpression = $attributes.outsideClick;
          onDocumentClick = function(event) {
            $timeout(function() {
              if (!contains($element[0], event.target)) {
                return $scope.$eval(scopeExpression);
              }
            });
          };
          $document.on("click", onDocumentClick);
          $element.on("$destroy", function() {
            $document.off("click", onDocumentClick);
          });
        }
      };
    }
  ]);

  app.directive('mbDatepicker', [
    '$filter', function($filter) {
      return {
        require: ['ngModel'],
        scope: {
          elementId: '@',
          dateFormat: '@',
          minDate: '@',
          maxDate: '@',
          inputClass: '@',
          inputName: '@',
          placeholder: '@',
          arrows: '=?',
          calendarHeader: '=?',
          utcMode: '=',
          ngDisabled: '=',
          label: '@',
          customInputClass: '@',
          tz: '='
        },
        template: '<div id="dateSelectors" class="date-selectors"  outside-click="hidePicker()"> <label ng-bind="label" class="mb-input-label" for="{{inputName}}"></label> <input name="{{ inputName }}" type="text" ng-disabled="{{ngDisabled}}" ng-class="{disabled: ngDisabled}" class="mb-input-field {{customInputClass}}"  ng-click="showPicker()"  class="form-control" id="{{inputName}}" placeholder="{{ placeholder }}" ng-model="innerModel" ng-change="innerChange()"> <div class="mb-datepicker" ng-show="isVisible"> <table> <caption> <div class="header-year-wrapper"> <span style="display: inline-block; float: left; padding-left:20px; cursor: pointer" class="noselect" ng-click="previousYear(currentDate)"><i class="material-icons">chevron_left</i></span> <span class="header-year noselect" ng-class="noselect">{{ year }}</span> <span style="display: inline-block; float: right; padding-right:20px; cursor: pointer" class="noselect" ng-click="nextYear(currentDate)"><i class="material-icons">chevron_right</i></span> </div> <div class="header-nav-wrapper"> <span class="header-item noselect" style="float: left; cursor:pointer" ng-click="previousMonth(currentDate)"><i class="material-icons">chevron_left</i></span> <span class="header-month noselect">{{ month }}</span> <span class="header-item header-right noselect" style="float: right; cursor:pointer" ng-click="nextMonth(currentDate)"> <i class="material-icons">chevron_right</i></span> </div> </caption> <tbody> <tr> <td class="day-head">{{ ::calendarHeader.sunday }}</td> <td class="day-head">{{ ::calendarHeader.monday }}</td> <td class="day-head">{{ ::calendarHeader.tuesday }}</td> <td class="day-head">{{ ::calendarHeader.wednesday }}</td> <td class="day-head">{{ ::calendarHeader.thursday }}</td> <td class="day-head">{{ ::calendarHeader.friday }}</td> <td class="day-head">{{ ::calendarHeader.saturday }}</td> </tr> <tr class="days" ng-repeat="week in weeks"> <td ng-click="selectDate(day)" class="noselect day-item" ng-repeat="day in week" ng-class="{selected: selectedDate === day.fmt, weekend: day.isWeekend, today: day.isToday, day: day.isEnabled, disabled: !day.isEnabled || day.isOtherMonth}"> <div style="display: block;"> {{ ::day.value }} </div> </td> </tr> </tbody> </table> </div> </div>',
        restrict: 'E',
        transclude: true,
        link: function(scope, element, attrs, ngModel) {
          var changeDisplay, dateChanged, days, defaultTimezone, getTimezone, getWeeks, init, selectors, today;
          defaultTimezone = luxon.DateTime.local().zoneName;
          selectors = element[0].querySelector('.date-selectors');
          today = luxon.DateTime.local();
          if (scope.utcMode) {
            today = today.toUTC();
          }
          scope.month = '';
          scope.year = today.year;
          if (scope.inputClass) {
            selectors.className = selectors.className + " " + scope.inputClass;
          }
          if (!scope.dateFormat) {
            scope.dateFormat = "yyyy-MM-dd";
          }
          if (scope.minDate) {
            scope.minDate = luxon.DateTime.fromFormat(scope.minDate, scope.dateFormat);
            if (scope.utcMode) {
              scope.minDate = scope.minDate.toUTC();
            }
          }
          if (scope.maxDate) {
            scope.maxDate = luxon.DateTime.fromFormat(scope.maxDate, scope.dateFormat);
            if (scope.utcMode) {
              scope.maxDate = scope.maxDate.toUTC();
            }
          }
          if (!scope.calendarHeader) {
            days = luxon.Info.weekdays('short');
            scope.calendarHeader = {
              sunday: days[6],
              monday: days[0],
              tuesday: days[1],
              wednesday: days[2],
              thursday: days[3],
              friday: days[4],
              saturday: days[5]
            };
          }
          getWeeks = function(monthLength, startDay, month) {
            var chunk_size, day, j, maxDayCompare, minDayCompare, monthDays, newDate, nowFormat, ref, start, weeks;
            monthDays = [];
            if (scope.minDate) {
              if (typeof scope.minDate === 'string') {
                scope.minDate = luxon.DateTime.fromFormat(scope.minDate, scope.dateFormat);
              }
              minDayCompare = scope.minDate.toFormat('yyyy-MM-dd');
            }
            if (scope.maxDate) {
              if (typeof scope.maxDate === 'string') {
                scope.maxDate = luxon.DateTime.fromFormat(scope.maxDate, scope.dateFormat);
              }
              maxDayCompare = scope.maxDate.toFormat('yyyy-MM-dd');
            }
            nowFormat = luxon.DateTime.local().setZone(getTimezone()).toFormat('yyyy-MM-dd');
            start = startDay.startOf('day');
            for (day = j = 0, ref = monthLength; 0 <= ref ? j <= ref : j >= ref; day = 0 <= ref ? ++j : --j) {
              if (scope.utcMode) {
                start = start.utc();
              }
              newDate = start.plus({
                days: day
              });
              day = {
                date: newDate,
                value: newDate.toFormat('dd'),
                fmt: newDate.toFormat('yyyy-MM-dd')
              };
              if (scope.minDate && day.fmt <= minDayCompare) {
                day.isToday = true;
                day.isEnabled = false;
              } else if (scope.maxDate && day.fmt >= maxDayCompare) {
                day.isToday = true;
                day.isEnabled = false;
              } else if (day.fmt === nowFormat) {
                day.isToday = true;
                day.isEnabled = true;
              } else if (newDate.month === month) {
                day.isToday = false;
                day.isEnabled = true;
                if (newDate.weekday === 7 || newDate.weekday === 6) {
                  day.isWeekend = true;
                }
              } else {
                day.isToday = false;
                day.isEnabled = true;
                day.isOtherMonth = true;
              }
              monthDays.push(day);
            }
            chunk_size = 7;
            weeks = monthDays.map(function(e, i) {
              if (i % chunk_size === 0) {
                return monthDays.slice(i, i + chunk_size);
              } else {
                return null;
              }
            }).filter(function(e) {
              return e;
            });
            if (weeks) {
              return weeks;
            } else {
              return [];
            }
          };
          changeDisplay = function(to) {
            var first_day, last_day;
            scope.year = to.year;
            last_day = to.endOf('month');
            if (last_day.weekday < 6) {
              last_day = last_day.endOf('week').plus({
                day: -1
              });
            } else if (last_day.weekday === 7) {
              last_day = last_day.plus({
                day: 6
              });
            }
            first_day = to.startOf('month').startOf('week').plus({
              days: -1
            });
            scope.currentDate = to;
            scope.weeks = [];
            scope.weeks = getWeeks(Math.floor(last_day.diff(first_day).as('day')), first_day, to.month);
            return scope.month = to.toFormat('MMM');
          };
          scope.nextMonth = function(date) {
            return changeDisplay(date.startOf('month').plus({
              month: 1
            }));
          };
          scope.previousMonth = function(date) {
            return changeDisplay(date.startOf('month').plus({
              month: -1
            }));
          };
          scope.nextYear = function(date) {
            return changeDisplay(date.startOf('month').plus({
              year: 1
            }));
          };
          scope.previousYear = function(date) {
            return changeDisplay(date.startOf('month').plus({
              year: -1
            }));
          };
          dateChanged = function(to, dontSetModel) {
            scope.selectedDate = to.toFormat('yyyy-MM-dd');
            scope.innerModel = to.toFormat(scope.dateFormat || 'yyyy-MM-dd');
            if (!dontSetModel) {
              ngModel[0].$setViewValue(to.toFormat(scope.dateFormat || 'yyyy-MM-dd'));
            }
            return changeDisplay(to);
          };
          getTimezone = function() {
            if (scope.tz) {
              return scope.tz;
            }
            return defaultTimezone;
          };
          scope.selectDate = function(day) {
            if (day.isEnabled) {
              dateChanged(day.date);
              return scope.isVisible = false;
            }
          };
          scope.isVisible = false;
          scope.showPicker = function() {
            var selectedDate;
            scope.isVisible = true;
            selectedDate = luxon.DateTime.fromFormat(scope.innerModel, scope.dateFormat || 'yyyy-MM-dd', {
              zone: getTimezone()
            });
            if (scope.currentDate.setZone(getTimezone()).toFormat('yyyy-MM') !== selectedDate.toFormat('yyyy-MM')) {
              changeDisplay(selectedDate.startOf('month'));
            }
          };
          scope.hidePicker = function() {
            scope.isVisible = false;
          };
          init = function() {
            dateChanged(luxon.DateTime.local().setZone(getTimezone()), true);
            scope.innerChange = function() {
              var date;
              date = luxon.DateTime.fromFormat(scope.innerModel, scope.dateFormat || 'yyyy-MM-dd', {
                zone: getTimezone()
              });
              if (!date.isValid()) {
                return;
              }
              return dateChanged(date);
            };
            scope.$watch((function() {
              return scope.tz;
            }), (function() {
              return ngModel[0].$render();
            }));
            return ngModel[0].$render = function() {
              var asDte;
              if (typeof ngModel[0].$viewValue === 'object') {
                asDte = luxon.DateTime.fromJSDate(ngModel[0].$viewValue, {
                  zone: getTimezone()
                });
              } else {
                asDte = luxon.DateTime.fromFormat(ngModel[0].$viewValue, scope.dateFormat || 'yyyy-MM-dd', {
                  zone: getTimezone()
                });
              }
              return dateChanged(asDte, true);
            };
          };
          return init();
        }
      };
    }
  ]);

}).call(this);
