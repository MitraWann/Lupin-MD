/**
 * wink.ai - Hann Universe
 * Free tools only: HD Image (高清) & Ultra HD Image (超清)
 * * Modifikasi: Menghapus auto-run dan mengekspor WinkClient & TASK
 */

'use strict';

const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs-extra');
const path     = require('path');
const qs       = require('qs');
const { v4: uuidv4 } = require('uuid');

const API = {
  BASE:     'https://wink.ai',
  STRATEGY: 'https://strategy.app.meitudata.com',
  QINIU:    'https://up-qagw.meitudata.com',
};

const CLIENT = {
  ID:       '1189857605',
  VERSION:  '3.7.1',
  LANGUAGE: 'en_US',
};

// Only 2 tool free (限免): 高清 & 超清
const TASK = {
  HD:       { type: 2,  label: 'HD Image',       content_type: 1, beans: 2, free: true  },
  ULTRA_HD: { type: 12, label: 'Ultra HD Image',  content_type: 1, beans: 4, free: true  },
};

const TYPE_PARAMS = {
  is_mirror: 0, orientation_tag: 1, j_420_trans: '1', return_ext: '2',
};

const RIGHT_DETAIL = {
  source: '4', touch_type: '4', function_id: '630', material_id: '63001',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadOrCreateGnum() {
  const f = path.join(process.cwd(), '.wink_gnum');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  const ts = Date.now().toString(16);
  const r1 = Math.random().toString(16).slice(2).padEnd(12, '0').slice(0, 12);
  const r2 = Math.random().toString(16).slice(2).padEnd(12, '0').slice(0, 12);
  const g  = `${ts}-${r1}-10462c6e-288000-${ts}${r2.slice(0, 3)}`;
  fs.writeFileSync(f, g);
  return g;
}

class WinkClient {
  constructor(opts = {}) {
    this.outputDir = opts.outputDir || './_wink';
    this.gnum      = loadOrCreateGnum();
    this.country   = opts.country  || 'ID';
    this.timezone  = opts.timezone || 'Asia/Makassar';
    this._timing   = {};

    fs.ensureDirSync(this.outputDir);

    this.http = axios.create({
      baseURL: API.BASE,
      timeout: 60_000,
      headers: {
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin':          API.BASE,
        'Referer':         `${API.BASE}/`,
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    this.http.interceptors.response.use(null, async err => {
      const cfg = err.config || {};
      cfg._retries = (cfg._retries || 0) + 1;
      const status = err.response?.status;
      if (cfg._retries <= 3 && (status >= 500 || !status)) {
        await sleep(cfg._retries * 2000);
        return this.http(cfg);
      }
      return Promise.reject(err);
    });
  }

  _p(extra = {}) {
    return {
      client_id:         CLIENT.ID,
      version:           CLIENT.VERSION,
      country_code:      this.country,
      gnum:              this.gnum,
      client_language:   CLIENT.LANGUAGE,
      client_channel_id: '',
      client_timezone:   this.timezone,
      ...extra,
    };
  }

  _t(name)     { this._timing[name] = { start: Date.now() }; }
  _te(name)    { if (this._timing[name]) this._timing[name].ms = Date.now() - this._timing[name].start; }

  async init() {
    this._t('init');
    const p = this._p();

    const [initRes, taskTypeRes, groupRes] = await Promise.allSettled([
      this.http.get('/api/init.json',                           { params: p }),
      this.http.get('/api/meitu_ai/task_type_config.json',      { params: p }),
      this.http.get('/api/meitu_ai_task_group/get_config.json', { params: p }),
    ]);

    const safe = r => r.status === 'fulfilled' ? r.value.data?.data : null;

    this._te('init');
    return {
      platform:       safe(initRes),
      task_types:     safe(taskTypeRes) || [],
      task_group:     safe(groupRes),
    };
  }

  async uploadFile(filePath) {
    this._t('upload');

    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

    const ext  = path.extname(filePath).toLowerCase() || '.jpg';
    const stat = fs.statSync(filePath);

    const validImg = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'];
    if (!validImg.includes(ext)) throw new Error(`Unsupported format: ${ext}. Supported: ${validImg.join(', ')}`);

    const signRes = await this.http.get('/api/file/get_maat_sign.json', {
      params: this._p({ suffix: ext, type: 'temp', count: 1 }),
    });
    const sign = signRes.data?.data;
    if (!sign?.sig) throw new Error('Failed to get upload signature');

    const policyRes = await axios.get(`${API.STRATEGY}/upload/policy`, {
      params: {
        app:        sign.app || 'wink',
        count:      1,
        sig:        sign.sig,
        sigTime:    sign.sig_time,
        sigVersion: sign.sig_version,
        suffix:     ext,
        type:       'temp',
      },
      timeout: 15_000,
    });
    const qiniu = policyRes.data?.[0]?.qiniu;
    if (!qiniu?.token) throw new Error('Failed to get Qiniu policy');

    const form = new FormData();
    form.append('token', qiniu.token);
    form.append('key',   qiniu.key);
    form.append('file',  fs.createReadStream(filePath), {
      filename:    path.basename(filePath),
      contentType: `image/${ext.replace('.', '').replace('jpg', 'jpeg')}`,
    });

    const uploadRes = await axios.post(qiniu.url || API.QINIU, form, {
      headers:           form.getHeaders(),
      timeout:           300_000,
      maxBodyLength:     Infinity,
      maxContentLength:  Infinity,
    });
    const uploaded = uploadRes.data;
    if (!uploaded?.url) throw new Error('Qiniu upload returned no URL');

    const metaRes = await this.http.post('/api/file/meta_info.json',
      qs.stringify({ ...this._p(), file_key: qiniu.key }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const meta = metaRes.data?.data;

    this._te('upload');
    return {
      fileKey:   qiniu.key,
      fileUrl:   uploaded.url,
      etag:      uploaded.etag,
      localPath: filePath,
      fileName:  path.basename(filePath),
      localSize: stat.size,
      storage: {
        bucket: qiniu.bucket,
        key:    qiniu.key,
        url:    qiniu.url,
        ttl:    qiniu.ttl,
      },
      sign: {
        sig:        sign.sig,
        sig_time:   sign.sig_time,
        sig_version:sign.sig_version,
      },
      meta: {
        width:      meta?.width,
        height:     meta?.height,
        format:     meta?.format,
        fileSize:   meta?.fileSize,
        colorModel: meta?.colorModel,
        frameNumber:meta?.frameNumber,
      },
    };
  }

  async submitTask(upload, taskCfg) {
    this._t('submit');

    const beansBody = qs.stringify({
      ...this._p(),
      item_list: JSON.stringify([{
        type:         taskCfg.type,
        ext_value:    '1',
        content_type: taskCfg.content_type,
        duration:     0,
        type_params:  JSON.stringify(TYPE_PARAMS),
        right_detail: JSON.stringify(RIGHT_DETAIL),
      }]),
    });
    const beansRes = await this.http.post('/api/subscribe/batch_calc_need_beans.json',
      beansBody, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const beans = beansRes.data?.data || {};

    const taskName = `${taskCfg.label.replace(/\s+/g, '_')}-${uuidv4().replace(/-/g,'').slice(0,16)}`;

    const body = qs.stringify({
      ...this._p(),
      type:         taskCfg.type,
      source_url:   upload.fileUrl,
      content_type: taskCfg.content_type,
      ext_params:   JSON.stringify({ task_name: taskName, records: '2' }),
      type_params:  JSON.stringify(TYPE_PARAMS),
      right_detail: JSON.stringify(RIGHT_DETAIL),
      with_prepare: 1,
    });

    const res = await this.http.post('/api/meitu_ai/delivery.json', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const delivery = res.data?.data;
    if (!delivery?.prepare_msg_id) throw new Error('No prepare_msg_id from delivery');

    this._te('submit');
    return {
      prepareMsgId:   delivery.prepare_msg_id,
      predictElapsed: delivery.predict_elapsed,
      errorCode:      delivery.error_code,
      taskName,
      taskCfg,
      beans: {
        required:    beans.beans_not_vip_without_free,
        requiredVip: beans.beans_vip_without_free,
        isFree:      beans.free_type === 1,
        freeType:    beans.free_type,
        freeId:      beans.beans_detail?.[0]?.free_id,
        freeNum:     beans.func_free_detail?.[0]?.free_num,
        usedNum:     beans.func_free_detail?.[0]?.use_num,
        totalNum:    beans.func_free_detail?.[0]?.total_num,
      },
    };
  }

  async waitForResult(task, pollMs = 2000, timeoutMs = 300_000) {
    this._t('poll');
    const deadline = Date.now() + timeoutMs;
    let   msgId    = task.prepareMsgId;
    let   attempt  = 0;
    const log      = [];

    while (Date.now() < deadline) {
      attempt++;
      await sleep(attempt === 1 ? 800 : pollMs);

      let res;
      try {
        res = await this.http.get('/api/meitu_ai/query_batch.json', {
          params: { ...this._p(), msg_ids: msgId },
        });
      } catch { continue; }

      const item    = res.data?.data?.item_list?.[0];
      const elapsed = Date.now() - this._timing.poll.start;

      if (!item) { log.push({ attempt, state: 'empty', elapsed }); continue; }

      if (msgId.startsWith('wpr_')) {
        const realId = item.result?.result;
        if (realId && realId !== msgId) {
          log.push({ attempt, state: 'prepare_resolved', prepareMsgId: msgId, realMsgId: realId, elapsed });
          msgId = realId;
        } else {
          log.push({ attempt, state: 'prepare_pending', elapsed });
        }
        continue;
      }

      const errCode = item.result?.error_code;
      const errMsg  = item.result?.error_msg;
      if (errCode && errCode !== 0) {
        this._te('poll');
        throw Object.assign(new Error(`AI error [${errCode}]: ${errMsg}`), { errCode, errMsg, pollLog: log });
      }

      const media = item.result?.media_info_list;
      if (media?.length && media[0].media_data) {
        log.push({ attempt, state: 'done', elapsed });
        this._te('poll');

        return {
          msgId,
          taskName: item.task_name,
          typeName: item.type_name,
          pollLog:  log,
          media: {
            url:       media[0].media_data,
            thumbUrl:  media[0].thumb_pic,
            coverUrl:  media[0].cover_pic,
            width:     item.width,
            height:    item.height,
            oriWidth:  item.ori_width,
            oriHeight: item.ori_height,
            size:      item.size,
            sizeHuman: item.size_human,
          },
          performance: {
            algoMs:      item.result?.duration?.alg_process_time,
            waitMs:      item.result?.duration?.waiting_time,
            uploadMs:    item.result?.duration?.upload_time,
            predictMs:   item.predict_elapsed,
            totalPollMs: elapsed,
            attempts:    attempt,
            algoVersion: item.result?.parameter?.version,
            algoTime:    item.result?.extra?.algo_msg?.alg_time,
          },
          rawResult: {
            errorCode: item.result?.error_code,
            errorMsg:  item.result?.error_msg,
            parameter: item.result?.parameter,
            duration:  item.result?.duration,
            bizPerf:   item.result?.biz_performance_data,
          },
        };
      }

      log.push({ attempt, state: 'processing', algoMs: item.result?.duration?.alg_process_time || 0, elapsed });
    }

    this._te('poll');
    throw Object.assign(new Error(`Timeout after ${timeoutMs}ms`), { pollLog: log });
  }

  async downloadResult(url, outFilename) {
    this._t('download');
    const outPath = path.join(this.outputDir, outFilename);

    const res = await axios.get(url, {
      responseType: 'stream',
      timeout:      120_000,
      headers:      { 'Referer': API.BASE },
    });

    await new Promise((ok, fail) => {
      const w = fs.createWriteStream(outPath);
      res.data.pipe(w);
      w.on('finish', ok);
      w.on('error', fail);
    });

    const diskSize = fs.statSync(outPath).size;
    this._te('download');
    return { outPath, diskSize };
  }
}

// Ekspor modul agar bisa diakses oleh sistem plugin Baileys
module.exports = { WinkClient, TASK };