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
    '$document', '$parse', function($document, $parse) {
      return {
        link: function($scope, $element, $attributes) {
          var onDocumentClick, scopeExpression;
          scopeExpression = $attributes.outsideClick;
          onDocumentClick = function(event) {
            if (!contains($element[0], event.target)) {
              $scope.$apply(scopeExpression);
            }
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
          customInputClass: '@'
        },
        template: '<div id="dateSelectors" class="date-selectors"  outside-click="hidePicker()"> <label ng-bind="label" class="mb-input-label" for="{{inputName}}"></label> <input name="{{ inputName }}" type="text" ng-disabled="{{ngDisabled}}" ng-class="{disabled: ngDisabled}" class="mb-input-field {{customInputClass}}"  ng-click="showPicker()"  class="form-control" id="{{inputName}}" placeholder="{{ placeholder }}" ng-model="innerModel" ng-change="innerChange()"> <div class="mb-datepicker" ng-show="isVisible"> <table> <caption> <div class="header-year-wrapper"> <span style="display: inline-block; float: left; padding-left:20px; cursor: pointer" class="noselect" ng-click="previousYear(currentDate)"><i class="material-icons">chevron_left</i></span> <span class="header-year noselect" ng-class="noselect">{{ year }}</span> <span style="display: inline-block; float: right; padding-right:20px; cursor: pointer" class="noselect" ng-click="nextYear(currentDate)"><i class="material-icons">chevron_right</i></span> </div> <div class="header-nav-wrapper"> <span class="header-item noselect" style="float: left; cursor:pointer" ng-click="previousMonth(currentDate)"><i class="material-icons">chevron_left</i></span> <span class="header-month noselect">{{ month }}</span> <span class="header-item header-right noselect" style="float: right; cursor:pointer" ng-click="nextMonth(currentDate)"> <i class="material-icons">chevron_right</i></span> </div> </caption> <tbody> <tr> <td class="day-head">{{ ::calendarHeader.sunday }}</td> <td class="day-head">{{ ::calendarHeader.monday }}</td> <td class="day-head">{{ ::calendarHeader.tuesday }}</td> <td class="day-head">{{ ::calendarHeader.wednesday }}</td> <td class="day-head">{{ ::calendarHeader.thursday }}</td> <td class="day-head">{{ ::calendarHeader.friday }}</td> <td class="day-head">{{ ::calendarHeader.saturday }}</td> </tr> <tr class="days" ng-repeat="week in weeks"> <td ng-click="selectDate(day)" class="noselect day-item" ng-repeat="day in week" ng-class="{selected: selectedDate === day.fmt, weekend: day.isWeekend, today: day.isToday, day: day.isEnabled, disabled: !day.isEnabled}"> <div style="display: block;"> {{ ::day.value }} </div> </td> </tr> </tbody> </table> </div> </div>',
        restrict: 'E',
        transclude: true,
        link: function(scope, element, attrs, ngModel) {
          var getWeeks, init, selectors, today;
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
          scope.nextMonth = function(date) {
            var first_day, last_day, next_month;
            next_month = moment(date).date(0);
            last_day = moment(next_month).add(4, 'months').date(0);
            scope.year = last_day.year();
            if (last_day.day() !== 7) {
              last_day = last_day.add(7 - last_day.day(), 'days');
            }
            first_day = moment(next_month).add(2, 'months').startOf('isoweek').add(-1, 'day');
            scope.currentDate = first_day;
            scope.weeks = [];
            scope.weeks = getWeeks(last_day.diff(first_day, 'days'), first_day, next_month.add(3, 'months').month());
            return scope.month = $filter('date')(new Date(next_month), 'MMM');
          };
          scope.previousMonth = function(date) {
            var first_day, last_day, last_month;
            last_month = moment(date).date(0);
            last_day = moment(last_month).add(2, 'months').date(0);
            scope.year = last_day.year();
            if (last_day.day() !== 7) {
              last_day = last_day.add(7 - last_day.day(), 'days');
            }
            first_day = moment(last_month).startOf('isoweek').add(-1, 'day');
            scope.currentDate = first_day;
            scope.weeks = [];
            scope.weeks = getWeeks(last_day.diff(first_day, 'days'), first_day, last_month.add(1, 'months').month());
            return scope.month = $filter('date')(new Date(last_month), 'MMM');
          };
          scope.nextYear = function(date) {
            var first_day, last_day, next_month;
            next_month = moment(date).date(0);
            last_day = moment(next_month).add(1, 'year').add(3, 'months').date(0);
            scope.year = last_day.year();
            if (last_day.day() !== 7) {
              last_day = last_day.add(7 - last_day.day(), 'days');
            }
            first_day = moment(next_month).add(1, 'years').add(1, 'months').startOf('isoweek').add(-1, 'day');
            scope.currentDate = first_day;
            scope.weeks = [];
            scope.weeks = getWeeks(last_day.diff(first_day, 'days'), first_day, next_month.add(2, 'months').month());
            return scope.month = $filter('date')(new Date(next_month), 'MMM');
          };
          scope.previousYear = function(date) {
            var first_day, last_day, last_month;
            last_month = moment(date).date(0);
            last_day = moment(last_month).subtract(1, 'years').add(3, 'months').date(0);
            scope.year = last_day.year();
            if (last_day.day() !== 7) {
              last_day = last_day.add(7 - last_day.day(), 'days');
            }
            first_day = moment(last_month).subtract(1, 'years').add(1, 'months').startOf('isoweek').add(-1, 'day');
            scope.currentDate = first_day;
            scope.weeks = [];
            scope.weeks = getWeeks(last_day.diff(first_day, 'days'), first_day, last_month.add(2, 'months').month());
            return scope.month = $filter('date')(new Date(last_month), 'MMM');
          };
          scope.selectDate = function(day) {
            var newDate;
            if (day.isEnabled) {
              newDate = day.date.format(scope.dateFormat);
              scope.selectedDate = day.fmt;
              scope.innerModel = day.date.format(scope.dateFormat || 'YYYY-MM-DD');
              ngModel[0].$setViewValue(newDate);
            }
            return scope.isVisible = false;
          };
          scope.isVisible = false;
          scope.showPicker = function() {
            scope.isVisible = true;
          };
          scope.hidePicker = function() {
            scope.isVisible = false;
          };
          init = function() {
            var days, endDate, firstSunday;
            if (scope.utcMode) {
              firstSunday = moment.utc(moment.utc().date(1)).startOf('isoweek').add(-1, 'day');
            } else {
              firstSunday = moment(moment().date(1)).startOf('isoweek').add(-1, 'day');
            }
            if (firstSunday.date() === 1) {
              firstSunday.subtract(1, 'weeks');
            }
            days = moment(moment().date(today.month())).daysInMonth();
            endDate = moment().add(1, 'months').date(0);
            scope.month = $filter('date')(new Date(endDate), 'MMM');
            if (endDate.day() !== 7) {
              endDate = endDate.add(7 - endDate.day(), 'days');
            }
            scope.innerChange = function() {
              var date;
              date = moment(scope.innerModel, scope.dateFormat || 'YYYY-MM-DD');
              if (!date.isValid()) {
                return;
              }
              scope.selectedDate = date.format('YYYY-MM-DD');
              return ngModel[0].$setViewValue(scope.innerModel);
            };
            ngModel[0].$render = function() {
              scope.selectedDate = moment(ngModel[0].$viewValue).format('YYYY-MM-DD');
              return scope.innerModel = moment(ngModel[0].$viewValue).format(scope.dateFormat || 'YYYY-MM-DD');
            };
            scope.currentDate = firstSunday;
            return scope.weeks = getWeeks(endDate.diff(firstSunday, 'days'), firstSunday, today.month());
          };
          return init();
        }
      };
    }
  ]);

}).call(this);
