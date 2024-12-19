/// import * as Autodesk from "@types/forge-viewer";

// truy vấn access token từ api /api/auth/token để cấp quyền truy cập dữ liệu trên autodesk platform
async function getAccessToken(callback) {
  try {
    const resp = await fetch('/api/auth/token');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    // console.log("get access token",resp);
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert('Could not obtain access token. See the console for more details.');
    console.error(err);
  }
}

// khởi tạo viewer trên giao diện tại thẻ DOM xác định: container
export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, function () {
      const config = {
        extensions: ['Autodesk.DocumentBrowser']
      };
      const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
      viewer.start();
      viewer.setTheme('light-theme');
      resolve(viewer);
    });
  });
}

// Tải 1 mô hình cụ thể lên viewer bằng URN
export function loadModel(viewer, urn) {
  return new Promise(function (resolve, reject) {
    function onDocumentLoadSuccess(doc) {
      resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
    }
    function onDocumentLoadFailure(code, message, errors) {
      reject({ code, message, errors });
    }
    viewer.setLightPreset(0);
    Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}