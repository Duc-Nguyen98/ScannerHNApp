import test from 'node:test';
import assert from 'node:assert/strict';
import {systemDocumentContext,connectionAction,cameraActions} from '../docs/flows/system/presentation.mjs';
const scope={actorId:'actor',warehouseId:'warehouse'},document={...scope,documentId:'id',number:'PN-0005',password:'never',token:'never',note:'private'};
test('P15 context uses exact owner identity and preserves full Unicode number without credentials',()=>{
 const number='Phiếu 🌸\n'+ 'Đ'.repeat(2000),context=systemDocumentContext('inbound',{document:{...document,number},unknown:true},scope);
 assert.equal(context.number,number);assert.equal(context.status,'Chưa xác định kết quả gửi');assert.equal(context.unknown,true);assert.equal(context.label,'Phiếu nhập');assert.equal('password' in context,false);assert.equal('token' in context,false);assert.equal('note' in context,false);
});
test('Missing, foreign or unknown-operation context never invented',()=>{
 for(const [operation,run,s]of [['inbound',{},scope],['inbound',{document},null],['inbound',{document:{documentId:'id',number:'PN'}},{}],['inbound',{document},{...scope,actorId:'other'}],['outbound',{document},{...scope,warehouseId:'other'}],['warranty',{document},scope]])assert.equal(systemDocumentContext(operation,run,s),null);
});
test('Write uncertainty wins over read label; no source produces guidance, never replay',()=>{
 assert.equal(connectionAction({intent:'read',hasRead:true}).label,'Tải lại');assert.equal(connectionAction({intent:'reconcile',hasRead:true}).label,'Đối chiếu kết quả');assert.equal(connectionAction({intent:'read',hasRead:true,unknown:true}).label,'Đối chiếu kết quả');assert.equal(connectionAction({intent:'reconcile',hasRead:false}).label,'Xem cách xử lý');assert.equal(connectionAction({intent:'read',hasRead:true,busy:true}).label,'Đang tải…');
});
test('Camera denied prioritizes guide with explicit recheck after settings; unsupported never prompts',()=>{
 assert.equal(cameraActions('not-requested')[0].label,'Cho phép camera');assert.equal(cameraActions('denied')[0].action,'camera-guide');assert.equal(cameraActions('denied')[1].secondary,true);assert.equal(cameraActions('hardware-error')[0].label,'Kiểm tra lại camera');assert.equal(cameraActions('unsupported').length,1);assert.equal(cameraActions('unsupported')[0].action,'camera-guide');assert.equal(cameraActions('denied',true)[1].disabled,true);
});
