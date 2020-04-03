import datetime
import json
import os
import requests
import sys

SOURCE = "CSBS"
REPORTS = [
    {
        "report_id": "ri.report.main.report.273e0b98-3e55-4a85-9bd8-da1349ee7701",
        "params": {"Source":[SOURCE], "State":["North Carolina"]},
        "name": "north_carolina.pptx"
    }
]

BASE_URL = "https://daikon.palantirfoundry.com"
REPORT_RENDER_URL = f"{BASE_URL}/resource-renderer/api/report/"
HEADERS = {'Authorization' : "Bearer {}".format(os.environ["TOKEN"])}


for report in REPORTS:
    print(f"rendering {report}")
    render_request = requests.post(
        f"{REPORT_RENDER_URL}{report['report_id']}",
        json={
            "asynchronous": False,
            "format":"PPT",
            "parameters": report["params"],
            "refreshCondition":{"always":"ALWAYS_REFRESH","type":"always"},
            "tmezone": "America/New_York"
        },
        headers=HEADERS
    )

    print(render_request.status_code)
    print(render_request.text)
    preview_rid = render_request.json()['previewRid']

    ppt_stream = requests.get(
        f"{BASE_URL}/resource-renderer/api/{preview_rid}/stream",
        headers=HEADERS
    )

    with open(sys.argv[4], "wb") as f:
        f.write(ppt_stream.content)