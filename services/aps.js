const { AuthenticationClient, Scopes } = require('@aps_sdk/authentication');
const { OssClient, Region, PolicyKey } = require('@aps_sdk/oss');
const { ModelDerivativeClient, View, OutputType } = require('@aps_sdk/model-derivative');
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_BUCKET } = require('../config.js');

const authenticationClient = new AuthenticationClient();
const ossClient = new OssClient();
const modelDerivativeClient = new ModelDerivativeClient();

const service = module.exports = {};

// generate access tokens for internal use ( đọc, ghi cho Data Management buckets and objects)
// lấy token xác thực (access tokens)
async function getInternalToken() {
  const credentials = await authenticationClient.getTwoLeggedToken(APS_CLIENT_ID, APS_CLIENT_SECRET, [
    Scopes.DataRead,
    Scopes.DataCreate,
    Scopes.DataWrite,
    Scopes.BucketCreate,
    Scopes.BucketRead
  ]);
  return credentials.access_token;
}

// generate tokens for public use -> chỉ đọc
// lấy token chỉ dành cho việc xem mô hình
service.getViewerToken = async () => {
  return await authenticationClient.getTwoLeggedToken(APS_CLIENT_ID, APS_CLIENT_SECRET, [Scopes.ViewablesRead]);
};


// OSS logic (Object Storage Service)

// Đảm bảo bucket có tên bucketKey có tồn tại. Nếu không tồn tại ( lỗi 404), hàm sẽ tự động tạo bucket mới với tên đó
service.ensureBucketExists = async (bucketKey) => {
  const accessToken = await getInternalToken();
  try {
    await ossClient.getBucketDetails(bucketKey, { accessToken });
  } catch (err) {
    if (err.axiosError.response.status === 404) {
      await ossClient.createBucket(Region.Us, { bucketKey: bucketKey, policyKey: PolicyKey.Persistent }, { accessToken });
    } else {
      throw err;
    }
  }
};

// Liệt kê tất cả các tệp trong bucket của ứng dụng
service.listObjects = async () => {
  await service.ensureBucketExists(APS_BUCKET);
  const accessToken = await getInternalToken();
  let resp = await ossClient.getObjects(APS_BUCKET, { limit: 64, accessToken });
  let objects = resp.items;
  while (resp.next) {
    const startAt = new URL(resp.next).searchParams.get('startAt');
    resp = await ossClient.getObjects(APS_BUCKET, { limit: 64, startAt, accessToken });
    objects = objects.concat(resp.items);
  }
  return objects;
};

// Tải tệp lên bucket của ứng dụng
service.uploadObject = async (objectName, filePath) => {
  await service.ensureBucketExists(APS_BUCKET);
  const accessToken = await getInternalToken();
  const obj = await ossClient.uploadObject(APS_BUCKET, objectName, filePath, { accessToken });
  return obj;
};

// Hàm chuyển đổi tệp thiết kế thành định dạng xem
service.translateObject = async (urn, rootFilename) => {
  const accessToken = await getInternalToken();
  const job = await modelDerivativeClient.startJob({
    input: {
      urn,
      compressedUrn: !!rootFilename,
      rootFilename
    },
    output: {
      formats: [{
        views: [View._2d, View._3d],
        type: OutputType.Svf2
      }]
    }
  }, { accessToken });
  return job.result;
};

// Hàm lấy thông tin Manifest (trạng thái chuyển đổi)
service.getManifest = async (urn) => {
  const accessToken = await getInternalToken();
  try {
    const manifest = await modelDerivativeClient.getManifest(urn, { accessToken });
    return manifest;
  } catch (err) {
    if (err.axiosError.response.status === 404) {
      return null;
    } else {
      throw err;
    }
  }
};

service.urnify = (id) => Buffer.from(id).toString('base64').replace(/=/g, '');