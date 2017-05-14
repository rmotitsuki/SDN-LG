# SDN-LG

Software-defined networking - Looking Glass aims to be a toolchain for SDN 
troubleshooting. It is designed to be modular, allowing new funcionalities 
to be easily added.
The main funcionalities are:
- Message Layer: a message layer allowing applications to communicate with
several different controllers.
- API allowing new controllers to be added.
- REST API structure that applications can use to communicate with other 
applications/web interface.

Shipping with the core, there are some applications:
- OpenFlow sniffer: OpenFlow message dissector, trying to be more complete
than Wireshark implementation.
- SDNTrace: Tracepath for OpenFlow networks.
- Real-time statistics.
- Historical statistics.
- Web interface to interact with the software

## How to use it

## How to write your own application

### Register your REST calls
To register an application REST calls, simple decorate the function that must
be called when the URL is reached.

    @route(url, methods=[])
    func(*args):
        ...
        
where `url` is the URL that will be called to reach your function. Any part of
the `url` between `<` and `>` will be an argument for the function. For example:

    @route('/func1/<func_id>', methods=['GET'])
    func1(func_id):
        ...
        
The URL will be prepended with the name of the module. 