#### 0.3.0 (2019-05-28)

##### Chores

* **example:**  add http server on sample ([38576700](https://github.com/lykmapipo/kue-common/commit/385767004369709e894cc0cae16f20ea31aab9d8))
* **deps:**
  *  run audit fixes ([824fe365](https://github.com/lykmapipo/kue-common/commit/824fe365fa49e8bee41f273691301b8a750591f1))
  *  force latest version & audit fix ([dac7bf05](https://github.com/lykmapipo/kue-common/commit/dac7bf05adb35e0b455312ddd437791a6dbd789f))

##### New Features

*  ensure basic auth on exposed http server ([39f67a57](https://github.com/lykmapipo/kue-common/commit/39f67a57a2b1daa38c62b929cfb0c7e96b678fd1))
*  expose listen to start kue internal http server ([269e4e4e](https://github.com/lykmapipo/kue-common/commit/269e4e4e40545705da94f279cca3dc91478e386b))
*  add http config with defaults ([fd6d4d83](https://github.com/lykmapipo/kue-common/commit/fd6d4d837f8c70451059d542ba3fcea799c8a7eb))

##### Other Changes

*  improve jsdoc ([e05223c7](https://github.com/lykmapipo/kue-common/commit/e05223c7ce7c7bb7cc7066bcfc642b188457a562))

##### Refactors

*  pass http options on listen callback ([7105361b](https://github.com/lykmapipo/kue-common/commit/7105361b55630b56e073ae41a13c8ccd113e8977))

#### 0.2.5 (2019-05-20)

##### Chores

* **deps:**  force latest version & audit fix ([01fccaf4](https://github.com/lykmapipo/kue-common/commit/01fccaf4ebe1525059edbdad9ab6a2a304228b1a))

#### 0.2.4 (2019-05-12)

##### Chores

* **deps:**  force latest version & audit fix ([11065dd2](https://github.com/lykmapipo/kue-common/commit/11065dd24e411b127998f0312ef62ec6cee76b03))

#### 0.2.3 (2019-05-01)

##### Chores

* **.npmrc:**  prevent npm version to commit and tag version ([820751ac](https://github.com/lykmapipo/kue-common/commit/820751ac4b44314ca6fbbb16d841f340d3c50e85))
* **deps:**  force latest version & audit fix ([9a157fce](https://github.com/lykmapipo/kue-common/commit/9a157fce192df11d51d3e371a1f0df3cd7fe8490))
* **ci:**  force latest nodejs ([c351742c](https://github.com/lykmapipo/kue-common/commit/c351742c2badb866aea4f353fd90d932b396e3b3))

#### 0.2.2 (2019-04-12)

##### Chores

*  force latest dependencies ([35901348](https://github.com/lykmapipo/kue-common/commit/3590134850d4a8e72d87aa34f1e3adef3811bbce))

#### 0.2.1 (2019-03-22)

##### Chores

*  force latest dependencies ([40dca936](https://github.com/lykmapipo/kue-common/commit/40dca93608137cddf64f85a0ec7eeffc1c779c17))

#### 0.2.0 (2019-02-06)

##### New Features

*  add options to clear to create redis client ([1f7286b7](https://github.com/lykmapipo/kue-common/commit/1f7286b788fe38c1e30127167ff049ad85f4e340))

##### Refactors

*  add options on clear and update usage docs ([faa6f0f0](https://github.com/lykmapipo/kue-common/commit/faa6f0f0368ac35a4d5713a1ac9d7a96c12348ee))

#### 0.1.0 (2019-01-24)

##### Chores

*  add usage example ([c14f7741](https://github.com/lykmapipo/kue-common/commit/c14f77415636f824bf5dd9ae6ec08aee41aff744))
*  fix extra line space ([ef16489e](https://github.com/lykmapipo/kue-common/commit/ef16489ebe8d21c0365dea726acd63744d538f10))
*  jshint files & add WIP flag on readme ([28073944](https://github.com/lykmapipo/kue-common/commit/28073944eb960e1bc64744c3b4693587b579e0ae))
*  add warlock dependency ([84928be6](https://github.com/lykmapipo/kue-common/commit/84928be656350ed486b59af3456dcfabefb8dcde))

##### Continuous Integration

*  add redis-service on .travis.yml ([574f6453](https://github.com/lykmapipo/kue-common/commit/574f6453d6ac1b90ef540c9d233955b61f817600))

##### Documentation Changes

*  remove unused readme sections ([8272cba1](https://github.com/lykmapipo/kue-common/commit/8272cba107d0142851ba434a349989ee3d8f31cb))

##### New Features

*  add onError listener register shortcut ([195cf134](https://github.com/lykmapipo/kue-common/commit/195cf134b69f7d3ccb829a9e74279ddb9d32d88e))
*  implement start ([c502778e](https://github.com/lykmapipo/kue-common/commit/c502778eeac3ab9237afeb1bf15c5cfc41dea2fb))
*  implement loadJobs ([8e98cba9](https://github.com/lykmapipo/kue-common/commit/8e98cba90d03a8f73cde5d62ff299150781bff89))
*  implment defineJob ([72e19980](https://github.com/lykmapipo/kue-common/commit/72e19980a346e5940c3d595d38b04b972faa82ab))
*  implement initial typed job dispatch ([b7374907](https://github.com/lykmapipo/kue-common/commit/b7374907ad560d9fdc97bf62dbb8a2f2dac8fbbd))
*  expose job priorities as constants ([48025f05](https://github.com/lykmapipo/kue-common/commit/48025f0557c3225990f6bf6619d9d54301184783))
*  expose queue events as constants ([96c02d43](https://github.com/lykmapipo/kue-common/commit/96c02d4369fe6ff1c6a39f8e8a0f4f13a8cbb23e))
*  expose job events as contasts ([ceed65f7](https://github.com/lykmapipo/kue-common/commit/ceed65f796cebce3e432f9961b5c8f181f204f68))
*  implement createPubSubClient ([c3c05ec7](https://github.com/lykmapipo/kue-common/commit/c3c05ec7b57bcce84ea08e09dcf7d0f691e4bb83))
*  implemet createClient ([1caf237c](https://github.com/lykmapipo/kue-common/commit/1caf237c3cd603ed941fe3a00a811b4940adc1b9))
*  implement createJob shortcut ([56b0254f](https://github.com/lykmapipo/kue-common/commit/56b0254fb9841f98e06d1a98a4ab4f2bc26f9a8c))
*  implement stop ([b6e9ae7c](https://github.com/lykmapipo/kue-common/commit/b6e9ae7c3ab3cbb9b2a4ac5cdc1ba6ba8378dde6))
*  implement createQueue ([d5b9cc7e](https://github.com/lykmapipo/kue-common/commit/d5b9cc7ea1580ea7802dfc4f533f8338d0ae33cd))
*  setup & implement withDefaults() ([406595e2](https://github.com/lykmapipo/kue-common/commit/406595e2dc54d942708ca277159d0d2bb29ddd3a))

##### Refactors

*  extract reset from stop logic ([ff769703](https://github.com/lykmapipo/kue-common/commit/ff76970347ee9ccb5e61b694a6a7a3da15304e03))

