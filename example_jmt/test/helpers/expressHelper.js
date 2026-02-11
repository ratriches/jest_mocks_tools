const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text());
app.use(express.raw());

const setRoute = (route, midlle) => {
  if (midlle) {
    midlle.forEach((m) => {
      app.use(m);
    });
  }
  app.use(route);
};

const doPost = async (route, body, headers = []) => {
  const req = request(app).post(route);
  for (const h of headers) {
    req.set(h.key, h.val);
  }
  return req.send(body);
};

const doGet = async (route, headers = []) => {
  const req = request(app).get(route);
  for (const h of headers) {
    req.set(h.key, h.val);
  }
  return req;
};

const close = async () => {};

const mkReqData = (url, headers, method, contLen, contTp, acpEnc) => {
  // replica comportamento de logRequest
  const ret = {
    headers: {
      'accept-encoding': 'gzip, deflate',
      connection: 'close',
      host: expect.any(String),
    },
    url,
    method,
    ipOrigin: expect.any(String),
  };
  for (const h of headers) {
    if (h.key == 'traceid') {
      ret.headers.traceid = h.val;
      ret.traceid = h.val;
    } else if (h.key == 'cookie') {
      const cookies = h.val;
      ret.headers.cookie = Object.entries(cookies).reduce((acc, [key, value]) => {
        acc[key] = value.length > 48 ? `${value.substring(0, 48)}...` : value;
        return acc;
      }, {});
    } else if (h.key == 'authorization') {
      ret.headers.authorization = h.val.substring(0, 18);
    }
  }
  if (contLen) {
    ret.headers['content-length'] = `${contLen}`;
  }
  if (contTp) {
    ret.headers['content-type'] = contTp;
  }
  if (acpEnc) {
    ret.headers['accept-encoding'] = acpEnc;
  }

  return ret;
};

module.exports = {
  setRoute,
  doPost,
  doGet,
  close,
  mkReqData,
};
