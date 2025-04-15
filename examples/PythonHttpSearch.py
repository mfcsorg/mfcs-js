import urllib.request
import urllib.parse
import urllib.error
import json
import argparse
import sys


def python_query(query: str):
    try:
        # URL编码查询参数
        encoded_query = urllib.parse.quote(query)
        url = f"https://r.jina.ai/https://www.baidu.com/s?wd={encoded_query}"

        # 创建请求对象并添加headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        request = urllib.request.Request(url, headers=headers)

        # 发送GET请求
        with urllib.request.urlopen(request) as response:
            # 读取响应数据
            response_data = response.read().decode("utf-8")

            # 限制响应数据到5000字符
            if isinstance(response_data, str):
                if len(response_data) > 5000:
                    response_data = response_data[:5000] + "... (content truncated)"
            elif isinstance(response_data, dict):
                # 如果是字典对象，转换为字符串后限制长度
                data_str = json.dumps(response_data)
                if len(data_str) > 5000:
                    truncated_str = data_str[:5000] + '..."} (content truncated)'
                    response_data = json.loads(truncated_str)

            return response_data

    except urllib.error.URLError as e:
        return f"Error performing search: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


def main():
    # 创建参数解析器
    parser = argparse.ArgumentParser(
        description="搜索工具", formatter_class=argparse.RawTextHelpFormatter
    )

    # 添加命令行参数
    parser.add_argument("-q", "--query", type=str, help="搜索查询内容", default=None)

    # 解析命令行参数
    args = parser.parse_args()

    # 如果没有提供查询参数，则请求用户输入
    if args.query is None:
        args.query = input("请输入搜索内容: ")

    # 执行查询
    result = python_query(args.query)
    # 修改这里，使用sys.stdout.buffer.write来输出UTF-8编码的字节
    sys.stdout.buffer.write(str(result).encode("utf-8"))


# 当作为主程序运行时执行main函数
if __name__ == "__main__":
    main()
