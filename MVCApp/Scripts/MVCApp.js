﻿$(document).ready(function () {

    $('#btnUpload').click(function () {
        var filesToUpload = $('#uploadFile')[0].files;

        // izračuna ukupnu mb fajlova zbog ukupnog broja partova (1 part = 1MB)
        //$('#total').val(TotalParts);

        var totalByteLength = 0;

        for (var i = 0; i < filesToUpload.length; i++) {
           totalByteLength += filesToUpload[i].size;
        }

        $('#total').val(totalByteLength / 1024 / 1024);
        $('#counter').val(0);

        $('.progress-bar').css('width', '0%')
            .attr('aria-valuenow', 0);
        $("#percentageText").text("0%");

        myApp.showPleaseWait(); 

        for (var i = 0; i < filesToUpload.length; i++) {
            UploadFile(filesToUpload[i]);
        }
    }
    )
});


function UploadFileChunk(Chunk, FileName, TotalParts) {
    var FD = new FormData();
    FD.append('file', Chunk, FileName);
    $.ajax({
        type: "POST",
        url: base_url + 'Home/UploadFile/',
        contentType: false,
        processData: false,
        data: FD,
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (e, data) {
                if (e.lengthComputable) { 
                    //console.log("progress:", $('#counter').val());
                    //$('#uploadFile').html('Uploading... ' + percentComplete + '%');
                    //$('.progress-bar').css('width', percentComplete + '%')
                    //    .attr('aria-valuenow', percentComplete);
                    //$("#percentageText").text(Math.round(percentComplete) + "%");
                }
                else $('#uploadFile').html('hmmm');
            }, false);
            return xhr;
        },
        success: function (data, textStatus, jqXHR) {
            //myApp.hidePleaseWait(); //hide dialog
            //$('.progress-bar').width(100);

            //var isSuccessful = (data['success']);

            //if (isSuccessful) {

            //}
            //else {
            //    var errors = data['errors'];
            //    displayValidationErrors(errors);
            //}

            var count = parseInt($('#counter').val()) + 1;
            $('#counter').val(count);   

            //console.log("success:", Math.floor($('#counter').val() / $('#total').val() * 100));
            console.log("success:", $('#counter').val(), $('#total').val());

            var percentage = Math.floor($('#counter').val() / $('#total').val() * 100);
            percentage = percentage > 100 ? 100 : percentage;

            $('.progress-bar').css('width', percentage + '%')
                .attr('aria-valuenow', percentage);
            $("#percentageText").text(Math.round(percentage) + "%");

            if (percentage === 100) {
                myApp.hidePleaseWait(); //hide dialog
            }

            console.log("success:", percentage);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            myApp.hidePleaseWait(); //hide dialog
            alert(xhr.responseText);
            //displayValidationErrors(xhr.responseText)
        }
    });
}

function UploadFile(TargetFile) {
    // create array to store the buffer chunks
    var FileChunk = [];
    // the file object itself that we will work with
    var file = TargetFile;
    // set up other initial vars
    var MaxFileSizeMB = 1;
    var BufferChunkSize = MaxFileSizeMB * (1024 * 1024);
    var ReadBuffer_Size = 1024;
    var FileStreamPos = 0;
    // set the initial chunk length
    var EndPos = BufferChunkSize;
    var Size = file.size;

    // add to the FileChunk array until we get to the end of the file
    while (FileStreamPos < Size) {
        // "slice" the file from the starting position/offset, to  the required length
        FileChunk.push(file.slice(FileStreamPos, EndPos));
        FileStreamPos = EndPos; // jump by the amount read
        EndPos = FileStreamPos + BufferChunkSize; // set next chunk length
    }
    // get total number of "files" we will be sending
    var TotalParts = FileChunk.length;

    var PartCount = 0;
    // loop through, pulling the first item from the array each time and sending it
    while (chunk = FileChunk.shift()) {
        PartCount++;
        // file name convention
        var FilePartName = file.name + ".part_" + PartCount + "." + TotalParts;
        // send the file
        UploadFileChunk(chunk, FilePartName, PartCount, TotalParts);
    }
}

var myApp;
myApp = myApp || (function () {
    var pleaseWaitDiv = $('#exampleModal');

    return {
        showPleaseWait: function () {
            pleaseWaitDiv.modal();
        },
        hidePleaseWait: function () {
            pleaseWaitDiv.modal('hide');
        },

    };
})()