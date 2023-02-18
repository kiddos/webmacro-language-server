#ifndef INDEX_H
#define INDEX_H

#include <nan.h>
#include <string>
#include <unordered_map>
#include <unordered_set>

namespace webmacro {

class Index : public Nan::ObjectWrap {
 public:
  Index() = default;

  void ReadVariables(const std::string& uri, const std::string& text);

  std::vector<std::string> GetVariables(const std::string& uri);

  static void Init(v8::Local<v8::Object> exports);

 private:
  std::unordered_map<std::string, std::unordered_set<std::string>> vars_;

  static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void ReadVariables(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetVariables(const Nan::FunctionCallbackInfo<v8::Value>& info);
};


}

#endif
