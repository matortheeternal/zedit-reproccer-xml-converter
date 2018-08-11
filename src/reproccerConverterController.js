ngapp.controller('reproccerConverterController', function($scope, reproccerConverter) {
    $scope.inputPath = fh.jetpack.path('Stats.xml');
    $scope.outputPath = fh.jetpack.path('output.json');

    $scope.browseForInput = function() {
        let label = 'Select Reproccer XML File';
        let inputPath = fh.selectFile(label, $scope.inputPath, [
            { name: 'XML document', extensions: 'xml' }
        ]);
        if (inputPath) $scope.inputPath = inputPath;
    };

    $scope.browseForOutput = function() {
        let label = 'Specify output path';
        let outputPath = fh.saveFile(label, $scope.outputPath, [
            { name: 'JSON file', extensions: 'json' }
        ]);
        if (outputPath) $scope.outputPath = outputPath;
    };

    $scope.convert = function() {
        if (fh.jetpack.exists($scope.inputPath) !== 'file')
            throw new Error(`${$scope.inputPath} does not exist.`);
        reproccerConverter.convert($scope.inputPath, $scope.outputPath);
        alert(`Converted "${$scope.inputPath}" successfully.`);
    };
});