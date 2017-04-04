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
        template: '<div id="dateSelectors" class="date-selectors"  outside-click="hidePicker()"> <label ng-bind="label" class="mb-input-label" for="{{inputName}}"></label> <input name="{{ inputName }}" type="text" ng-disabled="{{ngDisabled}}" ng-class="{disabled: ngDisabled}" class="mb-input-field {{customInputClass}}"  ng-click="showPicker()"  class="form-control" id="{{inputName}}" placeholder="{{ placeholder }}" ng-model="innerModel" ng-change="innerChange()"> <div class="mb-datepicker" ng-show="isVisible"> <table> <caption> <div class="header-year-wrapper"> <span style="display: inline-block; float: left; padding-left:20px; cursor: pointer" class="noselect" ng-click="previousYear(currentDate)"><i class="material-icons">chevron_left</i></span> <span class="header-year noselect" ng-class="noselect">{{ year }}</span> <span style="display: inline-block; float: right; padding-right:20px; cursor: pointer" class="noselect" ng-click="nextYear(currentDate)"><i class="material-icons">chevron_right</i></span> </div> <div class="header-nav-wrapper"> <span class="header-item noselect" style="float: left; cursor:pointer" ng-click="previousMonth(currentDate)"><i class="material-icons">chevron_left</i></span> <span class="header-month noselect">{{ month }}</span> <span class="header-item header-right noselect" style="float: right; cursor:pointer" ng-click="nextMonth(currentDate)"> <i class="material-icons">chevron_right</i></span> </div> </caption> <tbody> <tr> <td class="day-head">{{ ::calendarHeader.sunday }}</td> <td class="day-head">{{ ::calendarHeader.monday }}</td> <td class="day-head">{{ ::calendarHeader.tuesday }}</td> <td class="day-head">{{ ::calendarHeader.wednesday }}</td> <td class="day-head">{{ ::calendarHeader.thursday }}</td> <td class="day-head">{{ ::calendarHeader.friday }}</td> <td class="day-head">{{ ::calendarHeader.saturday }}</td> </tr> <tr class="days" ng-repeat="week in weeks"> <td ng-click="selectDate(day)" class="noselect day-item" ng-repeat="day in week" ng-class="{selected: selectedDate === day.fmt, weekend: day.isWeekend, today: day.isToday, day: day.isEnabled, disabled: !day.isEnabled}"> <div style="display: block;"> {{ ::day.value }} </div> </td> </tr> </tbody> </table> </div> </div>',
        restrict: 'E',
        transclude: true,
        link: function(scope, element, attrs, ngModel) {
          var changeDisplay, dateChanged, defaultTimezone, getTimezone, getWeeks, init, selectors, today;
          defaultTimezone = moment.tz.guess();
          selectors = element[0].querySelector('.date-selectors');
          today = moment();
          if (scope.utcMode) {
            today.utc();
          }
          scope.month = '';
          scope.year = today.year();
          if (scope.inputClass) {
            selectors.className = selectors.className + " " + scope.inputClass;
          }
          if (!scope.dateFormat) {
            scope.dateFormat = "YYYY-MM-DD";
          }
          if (scope.minDate) {
            scope.minDate = moment(scope.minDate, scope.dateFormat);
            if (scope.utcMode) {
              scope.minDate.utc();
            }
          }
          if (scope.maxDate) {
            scope.maxDate = moment(scope.maxDate, scope.dateFormat);
            if (scope.utcMode) {
              scope.maxDate.utc();
            }
          }
          if (!scope.calendarHeader) {
            scope.calendarHeader = {
              sunday: $filter('date')(new Date(moment().isoWeekday(7)), 'EEE'),
              monday: $filter('date')(new Date(moment().isoWeekday(1)), 'EEE'),
              tuesday: $filter('date')(new Date(moment().isoWeekday(2)), 'EEE'),
              wednesday: $filter('date')(new Date(moment().isoWeekday(3)), 'EEE'),
              thursday: $filter('date')(new Date(moment().isoWeekday(4)), 'EEE'),
              friday: $filter('date')(new Date(moment().isoWeekday(5)), 'EEE'),
              saturday: $filter('date')(new Date(moment().isoWeekday(6)), 'EEE')
            };
          }
          getWeeks = function(monthLength, startDay, month) {
            var chunk_size, day, j, monthDays, newDate, ref, start, weeks;
            monthDays = [];
            for (day = j = 0, ref = monthLength; 0 <= ref ? j <= ref : j >= ref; day = 0 <= ref ? ++j : --j) {
              start = moment(startDay);
              if (scope.utcMode) {
                start.utc();
              }
              newDate = start.add(day, 'd');
              day = {
                date: newDate,
                value: newDate.format('DD'),
                fmt: newDate.format('YYYY-MM-DD')
              };
              if (scope.minDate && moment(newDate, scope.dateFormat) <= moment(scope.minDate, scope.dateFormat)) {
                day.isToday = true;
                day.isEnabled = false;
                monthDays.push(day);
              } else if (scope.maxDate && moment(newDate, scope.dateFormat) >= moment(scope.maxDate, scope.dateFormat)) {
                day.isToday = true;
                day.isEnabled = false;
              } else if (newDate.format(scope.dateFormat) === moment().format(scope.dateFormat)) {
                day.isToday = true;
                day.isEnabled = true;
              } else if (newDate.month() === month) {
                day.isToday = false;
                day.isEnabled = true;
                if (newDate.day() === 0 || newDate.day() === 6) {
                  day.isWeekend = true;
                }
              } else {
                day.isToday = false;
                day.isEnabled = false;
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
            scope.year = to.year();
            last_day = moment(to).add(1, 'month').date(0);
            if (last_day.day() !== 7) {
              last_day = last_day.add(6 - last_day.day(), 'days');
            }
            first_day = moment(to).date(0).startOf('isoweek').add(-1, 'day');
            scope.currentDate = to;
            scope.weeks = [];
            scope.weeks = getWeeks(last_day.diff(first_day, 'days'), first_day, to.month());
            return scope.month = $filter('date')(to.toDate(), 'MMM');
          };
          scope.nextMonth = function(date) {
            return changeDisplay(date.date(1).add(1, 'month'));
          };
          scope.previousMonth = function(date) {
            return changeDisplay(date.date(1).add(-1, 'month'));
          };
          scope.nextYear = function(date) {
            return changeDisplay(date.date(1).add(1, 'year'));
          };
          scope.previousYear = function(date) {
            return changeDisplay(date.date(1).add(-1, 'year'));
          };
          dateChanged = function(to, dontSetModel) {
            scope.selectedDate = to.format('YYYY-MM-DD');
            scope.innerModel = to.format(scope.dateFormat || 'YYYY-MM-DD');
            if (!dontSetModel) {
              ngModel[0].$setViewValue(to.format(scope.dateFormat || 'YYYY-MM-DD'));
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
            dateChanged(day.date);
            return scope.isVisible = false;
          };
          scope.isVisible = false;
          scope.showPicker = function() {
            var selectedDate;
            scope.isVisible = true;
            selectedDate = moment.tz(scope.innerModel, scope.dateFormat || 'YYYY-MM-DD', getTimezone());
            if (scope.currentDate.tz(getTimezone()).format('YYYY-MM') !== selectedDate.format('YYYY-MM')) {
              changeDisplay(selectedDate.date(1));
            }
          };
          scope.hidePicker = function() {
            scope.isVisible = false;
          };
          init = function() {
            dateChanged(moment().tz(getTimezone()), true);
            scope.innerChange = function() {
              var date;
              date = moment.tz(scope.innerModel, scope.dateFormat || 'YYYY-MM-DD', getTimezone());
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
              return dateChanged(moment(ngModel[0].$viewValue).tz(getTimezone()), true);
            };
          };
          return init();
        }
      };
    }
  ]);

}).call(this);
