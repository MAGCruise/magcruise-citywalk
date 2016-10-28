$(function() {
  swalConfirm('LocalStorageを初期化します', "", "warning", function(isOk) {
    if (isOk) {
      clear();
      swal.close();
      setTimeout(function() {
        swalWarning('LocalStorageを初期化しました');
      }, 300);
    } else {
      swalWarning('LocalStorageの初期化がキャンセルされました');
    }
  });
});
