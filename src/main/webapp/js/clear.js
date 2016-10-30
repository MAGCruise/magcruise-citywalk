$(function() {
  swalConfirm('LocalStorageを初期化します', "", "warning", function(isOk) {
    if (isOk) {
      clear();
      swal.close();
      setTimeout(function() {
        swalAlert('LocalStorageを初期化しました');
      }, 300);
    } else {
      setTimeout(function() {
        swalAlert('LocalStorageの初期化がキャンセルされました');
      }, 300);
    }
  });
});
