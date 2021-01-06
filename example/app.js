/**
 * Created by mobinni on 22/04/15.
 */
var app = angular.module('exampleApp', [
    'materialDatePicker'
]);

app.controller('MainCtrl', function ($scope, $timeout) {
    $scope.date = luxon.DateTime.local().toJSDate();
    // $scope.header = {
    //     monday: 'Mon',
    //     tuesday: 'Tue',
    //     wednesday: 'Wed',
    //     thursday: 'Thu',
    //     friday: 'Fri',
    //     saturday: 'Sat',
    //     sunday: 'Sun',
    // };
    $timeout(function () {
        $scope.tz = 'Australia/Sydney';
    }, 1000);

    $scope.dateChanged = function () {
        console.log('it changed!', $scope.date);
    };
});
